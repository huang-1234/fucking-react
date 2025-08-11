/**
 * 缓存工具
 * 实现LRU缓存，支持TTL过期时间
 */

export interface CacheOptions {
  ttl: number;              // 过期时间(ms)
  maxSize: number;          // 最大缓存项数
  namespace?: string;       // 缓存命名空间
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
}

interface CacheItem<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

/**
 * 创建LRU缓存
 */
export function createCache(options: CacheOptions): CacheManager {
  const { ttl, maxSize, namespace = 'default' } = options;
  const cache = new Map<string, CacheItem<any>>();

  let hits = 0;
  let misses = 0;

  // 生成带命名空间的键
  const makeKey = (key: string): string => `${namespace}:${key}`;

  // 清理过期项
  const cleanup = (): void => {
    const now = Date.now();
    const expired: string[] = [];

    // 找出过期项
    for (const [key, item] of cache.entries()) {
      if (item.expiry <= now) {
        expired.push(key);
      }
    }

    // 删除过期项
    for (const key of expired) {
      cache.delete(key);
    }
  };

  // 清理超出大小限制的项（删除最久未访问的）
  const enforceSize = (): void => {
    if (cache.size <= maxSize) return;

    // 按最后访问时间排序
    const entries = [...cache.entries()]
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // 删除最久未访问的项，直到大小符合限制
    const toDelete = entries.slice(0, cache.size - maxSize);
    for (const [key] of toDelete) {
      cache.delete(key);
    }
  };

  // 定期清理
  const cleanupInterval = setInterval(cleanup, Math.min(ttl / 2, 60000));

  // 防止内存泄漏
  if (typeof process !== 'undefined') {
    process.on('exit', () => {
      clearInterval(cleanupInterval);
    });
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      const namespacedKey = makeKey(key);
      const item = cache.get(namespacedKey);

      // 如果不存在或已过期
      if (!item || item.expiry <= Date.now()) {
        if (item) cache.delete(namespacedKey); // 删除过期项
        misses++;
        return null;
      }

      // 更新最后访问时间
      item.lastAccessed = Date.now();
      hits++;

      return item.value as T;
    },

    async set<T>(key: string, value: T, customTtl?: number): Promise<void> {
      const namespacedKey = makeKey(key);
      const expiry = Date.now() + (customTtl || ttl);

      cache.set(namespacedKey, {
        value,
        expiry,
        lastAccessed: Date.now()
      });

      // 确保缓存大小不超过限制
      enforceSize();
    },

    async delete(key: string): Promise<void> {
      cache.delete(makeKey(key));
    },

    async clear(): Promise<void> {
      cache.clear();
      hits = 0;
      misses = 0;
    },

    async stats(): Promise<CacheStats> {
      cleanup(); // 清理过期项，确保统计准确

      const size = cache.size;
      const total = hits + misses;
      const hitRate = total === 0 ? 0 : hits / total;

      return {
        hits,
        misses,
        size,
        hitRate
      };
    }
  };
}