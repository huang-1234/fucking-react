/**
 * 缓存管理器
 * 提供多级缓存策略，支持内存、Redis等存储
 */

// 缓存项接口
export interface CacheItem<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
  metadata?: Record<string, any>;
}

// 缓存选项
export interface CacheOptions {
  ttl: number;              // 默认过期时间(ms)
  maxSize?: number;         // 最大缓存项数
  namespace?: string;       // 缓存命名空间
  storage?: 'memory' | 'redis'; // 存储类型
  redisConfig?: {           // Redis配置（如果使用Redis存储）
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

// 缓存统计
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// 缓存管理器接口
export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number, metadata?: Record<string, any>): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
}

/**
 * 内存缓存实现
 */
class MemoryCache implements CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private ttl: number;
  private maxSize: number;
  private namespace: string;
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions) {
    this.ttl = options.ttl;
    this.maxSize = options.maxSize || Infinity;
    this.namespace = options.namespace || 'default';
  }

  // 生成带命名空间的键
  private makeKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  // 清理过期项
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    // 找出过期项
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry <= now) {
        expired.push(key);
      }
    }

    // 删除过期项
    for (const key of expired) {
      this.cache.delete(key);
    }
  }

  // 强制执行大小限制
  private enforceSize(): void {
    if (this.cache.size <= this.maxSize) return;

    // 按最后访问时间排序
    const entries = [...this.cache.entries()]
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // 删除最久未访问的项，直到大小符合限制
    const toDelete = entries.slice(0, this.cache.size - this.maxSize);
    for (const [key] of toDelete) {
      this.cache.delete(key);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const namespacedKey = this.makeKey(key);
    const item = this.cache.get(namespacedKey);

    // 如果不存在或已过期
    if (!item || item.expiry <= Date.now()) {
      if (item) this.cache.delete(namespacedKey); // 删除过期项
      this.misses++;
      return null;
    }

    // 更新最后访问时间
    item.lastAccessed = Date.now();
    this.hits++;

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number, metadata?: Record<string, any>): Promise<void> {
    const namespacedKey = this.makeKey(key);
    const expiry = Date.now() + (ttl || this.ttl);

    this.cache.set(namespacedKey, {
      value,
      expiry,
      lastAccessed: Date.now(),
      metadata
    });

    // 确保缓存大小不超过限制
    this.enforceSize();
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(this.makeKey(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async stats(): Promise<CacheStats> {
    this.cleanup(); // 清理过期项，确保统计准确

    const size = this.cache.size;
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : this.hits / total;

    return {
      hits: this.hits,
      misses: this.misses,
      size,
      hitRate
    };
  }
}

/**
 * Redis缓存实现（如果有Redis客户端）
 * 注意：这需要安装redis包
 */
class RedisCache implements CacheManager {
  private client: any;
  private ttl: number;
  private namespace: string;
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions) {
    this.ttl = options.ttl;
    this.namespace = options.namespace || 'default';

    // 如果在Serverless环境中，延迟初始化Redis客户端
    if (!process.env.IS_SERVERLESS) {
      this.initRedisClient(options.redisConfig);
    }
  }

  // 延迟初始化Redis客户端
  private async initRedisClient(config?: CacheOptions['redisConfig']) {
    try {
      // 动态导入redis，避免在不需要时加载
      const { createClient } = await import('redis');

      this.client = createClient({
        url: `redis://${config?.host || 'localhost'}:${config?.port || 6379}`,
        password: config?.password,
        database: config?.db || 0
      });

      await this.client.connect();
    } catch (error) {
      console.error('Redis初始化失败:', error);
      // 降级为内存缓存
      console.warn('降级为内存缓存');
    }
  }

  // 确保Redis客户端已连接
  private async ensureClient() {
    if (!this.client) {
      await this.initRedisClient();
    }
    return !!this.client;
  }

  // 生成带命名空间的键
  private makeKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const hasClient = await this.ensureClient();
    if (!hasClient) return null;

    try {
      const namespacedKey = this.makeKey(key);
      const data = await this.client.get(namespacedKey);

      if (!data) {
        this.misses++;
        return null;
      }

      const item = JSON.parse(data);

      // 更新访问计数
      this.hits++;

      return item.value as T;
    } catch (error) {
      console.error('Redis获取缓存错误:', error);
      this.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number, metadata?: Record<string, any>): Promise<void> {
    const hasClient = await this.ensureClient();
    if (!hasClient) return;

    try {
      const namespacedKey = this.makeKey(key);
      const expiry = Date.now() + (ttl || this.ttl);

      const item = {
        value,
        expiry,
        lastAccessed: Date.now(),
        metadata
      };

      await this.client.set(
        namespacedKey,
        JSON.stringify(item),
        { EX: Math.ceil((ttl || this.ttl) / 1000) }
      );
    } catch (error) {
      console.error('Redis设置缓存错误:', error);
    }
  }

  async delete(key: string): Promise<void> {
    const hasClient = await this.ensureClient();
    if (!hasClient) return;

    try {
      await this.client.del(this.makeKey(key));
    } catch (error) {
      console.error('Redis删除缓存错误:', error);
    }
  }

  async clear(): Promise<void> {
    const hasClient = await this.ensureClient();
    if (!hasClient) return;

    try {
      const keys = await this.client.keys(`${this.namespace}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      this.hits = 0;
      this.misses = 0;
    } catch (error) {
      console.error('Redis清空缓存错误:', error);
    }
  }

  async stats(): Promise<CacheStats> {
    const hasClient = await this.ensureClient();
    if (!hasClient) {
      return {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
      };
    }

    try {
      const keys = await this.client.keys(`${this.namespace}:*`);
      const size = keys.length;
      const total = this.hits + this.misses;
      const hitRate = total === 0 ? 0 : this.hits / total;

      return {
        hits: this.hits,
        misses: this.misses,
        size,
        hitRate
      };
    } catch (error) {
      console.error('Redis获取统计错误:', error);
      return {
        hits: this.hits,
        misses: this.misses,
        size: 0,
        hitRate: 0
      };
    }
  }
}

/**
 * 创建缓存管理器
 */
export function createCache(options: CacheOptions): CacheManager {
  // 根据存储类型选择缓存实现
  if (options.storage === 'redis' && !process.env.IS_SERVERLESS) {
    try {
      return new RedisCache(options);
    } catch (error) {
      console.error('Redis缓存初始化失败，降级为内存缓存:', error);
      return new MemoryCache(options);
    }
  }

  // 默认使用内存缓存
  return new MemoryCache(options);
}

/**
 * 多级缓存管理器
 * 支持内存+Redis的多级缓存
 */
export class MultiLevelCache implements CacheManager {
  private l1Cache: CacheManager; // 内存缓存（一级缓存）
  private l2Cache?: CacheManager; // Redis缓存（二级缓存）

  constructor(options: CacheOptions & { l2Options?: CacheOptions }) {
    // 创建内存缓存（一级缓存）
    this.l1Cache = createCache({
      ...options,
      storage: 'memory'
    });

    // 如果配置了二级缓存，创建Redis缓存
    if (options.storage === 'redis' && options.redisConfig && !process.env.IS_SERVERLESS) {
      try {
        this.l2Cache = createCache({
          ...options,
          ...(options.l2Options || {}),
          storage: 'redis'
        });
      } catch (error) {
        console.error('二级缓存初始化失败:', error);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // 先从一级缓存获取
    const l1Result = await this.l1Cache.get<T>(key);
    if (l1Result !== null) {
      return l1Result;
    }

    // 如果一级缓存没有，尝试从二级缓存获取
    if (this.l2Cache) {
      const l2Result = await this.l2Cache.get<T>(key);
      if (l2Result !== null) {
        // 将结果回填到一级缓存
        await this.l1Cache.set(key, l2Result);
        return l2Result;
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number, metadata?: Record<string, any>): Promise<void> {
    // 同时写入一级和二级缓存
    await this.l1Cache.set(key, value, ttl, metadata);

    if (this.l2Cache) {
      await this.l2Cache.set(key, value, ttl, metadata);
    }
  }

  async delete(key: string): Promise<void> {
    // 同时从一级和二级缓存删除
    await this.l1Cache.delete(key);

    if (this.l2Cache) {
      await this.l2Cache.delete(key);
    }
  }

  async clear(): Promise<void> {
    // 同时清空一级和二级缓存
    await this.l1Cache.clear();

    if (this.l2Cache) {
      await this.l2Cache.clear();
    }
  }

  async stats(): Promise<CacheStats> {
    // 获取一级缓存统计
    const l1Stats = await this.l1Cache.stats();

    // 如果有二级缓存，合并统计
    if (this.l2Cache) {
      const l2Stats = await this.l2Cache.stats();

      const totalHits = l1Stats.hits + l2Stats.hits;
      const totalMisses = l1Stats.misses + l2Stats.misses;
      const totalRequests = totalHits + totalMisses;

      return {
        hits: totalHits,
        misses: totalMisses,
        size: l1Stats.size + l2Stats.size,
        hitRate: totalRequests === 0 ? 0 : totalHits / totalRequests
      };
    }

    return l1Stats;
  }
}

// 导出默认缓存实例
export default function createDefaultCache(options?: Partial<CacheOptions>): CacheManager {
  return new MultiLevelCache({
    ttl: options?.ttl || 60 * 1000, // 默认1分钟
    maxSize: options?.maxSize || 1000,
    namespace: options?.namespace || 'ssr-cache',
    storage: options?.storage || 'memory',
    redisConfig: options?.redisConfig
  });
}
