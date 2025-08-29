/**
 * 缓存中间件
 * 实现页面级缓存，减轻服务器渲染压力
 */
import { Context, Next } from 'koa';
import createDefaultCache, { CacheManager } from '../../core/cache-manager';

// 缓存键生成函数
const generateCacheKey = (ctx: Context): string => {
  const { method, url, headers } = ctx.request;
  // 使用请求方法、URL和一些关键请求头作为缓存键
  return `${method}:${url}:${headers['accept-language'] || 'default'}`;
};

// 判断请求是否可缓存
const isCacheable = (ctx: Context): boolean => {
  // 只缓存GET请求
  if (ctx.method !== 'GET') return false;

  // 不缓存带有特定查询参数的请求
  if (ctx.query.nocache !== undefined) return false;

  // 不缓存带有认证信息的请求
  if (ctx.cookies.get('auth') || ctx.headers.authorization) return false;

  // 不缓存静态资源
  if (ctx.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) return false;

  // 不缓存API请求
  if (ctx.path.startsWith('/api/')) return false;

  return true;
};

// 缓存中间件配置选项
export interface CacheMiddlewareOptions {
  enabled?: boolean;      // 是否启用缓存
  ttl?: number;           // 缓存过期时间
  maxSize?: number;       // 最大缓存项数
  namespace?: string;     // 缓存命名空间
  storage?: 'memory' | 'redis'; // 存储类型
  redisConfig?: {         // Redis配置
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  cacheManager?: CacheManager; // 自定义缓存管理器
}

// 缓存响应类型
interface CachedResponse {
  status: number;
  type: string;
  body: string;
  headers: Record<string, string>;
  timestamp: number;
}

// 缓存中间件
export default function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    enabled = true,
    ttl = 60 * 1000,
    maxSize = 1000,
    namespace = 'page-cache',
    storage = 'memory',
    redisConfig,
    cacheManager
  } = options;

  // 如果缓存未启用，则跳过
  if (!enabled) {
    return async (ctx: Context, next: Next) => {
      await next();
    };
  }

  // 创建缓存管理器
  const cache = cacheManager || createDefaultCache({
    ttl,
    maxSize,
    namespace,
    storage,
    redisConfig
  });

  return async (ctx: Context, next: Next) => {
    // 如果请求不可缓存，则跳过
    if (!isCacheable(ctx)) {
      return await next();
    }

    const cacheKey = generateCacheKey(ctx);

    // 尝试从缓存获取
    const cachedResponse = await cache.get<CachedResponse>(cacheKey);

    if (cachedResponse) {
      // 检查是否过期
      if (cachedResponse.timestamp + ttl < Date.now()) {
        await cache.delete(cacheKey);
      } else {
        // 命中缓存，直接返回缓存的响应
        ctx.status = cachedResponse.status;
        ctx.type = cachedResponse.type;
        ctx.body = cachedResponse.body;

        // 设置缓存相关的响应头
        ctx.set('X-Cache', 'HIT');

        // 设置其他缓存的响应头
        for (const [key, value] of Object.entries(cachedResponse.headers)) {
          ctx.set(key, value);
        }

        return;
      }
    }

    // 未命中缓存，继续处理请求
    ctx.set('X-Cache', 'MISS');

    // 保存原始的响应设置方法
    const originalSetResponse = ctx.response.set;
    const headers: Record<string, string> = {};

    // 劫持响应头设置方法，以便我们可以捕获所有设置的响应头
    ctx.response.set = function(
      field: string | { [key: string]: string | string[] },
      val?: string | string[]
    ) {
      if (typeof field === 'string' && val !== undefined) {
        headers[field] = Array.isArray(val) ? val[0] : val;
      } else if (typeof field === 'object') {
        Object.entries(field).forEach(([key, value]) => {
          headers[key] = Array.isArray(value) ? value[0] : value;
        });
      }
      return originalSetResponse.apply(this, arguments as any);
    };

    await next();

    // 如果响应成功且是HTML，则缓存响应
    if (ctx.status === 200 && ctx.response.type.includes('html')) {
      // 只缓存字符串类型的响应体
      if (typeof ctx.body === 'string') {
        await cache.set(cacheKey, {
          status: ctx.status,
          type: ctx.type,
          body: ctx.body,
          headers,
          timestamp: Date.now()
        }, ttl);
      }
    }
  };
}