/**
 * 缓存中间件
 * 实现页面级缓存，减轻服务器渲染压力
 */
import { Context, Next } from 'koa';

// 简单的内存缓存实现
class MemoryCache {
  private cache: Map<string, { content: any; expiry: number }> = new Map();
  private ttl: number;

  constructor(ttl = 60 * 1000) { // 默认缓存60秒
    this.ttl = ttl;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.content as T;
  }

  set(key: string, content: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.ttl);
    this.cache.set(key, { content, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 创建缓存实例
const pageCache = new MemoryCache();

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

  return true;
};

// 缓存中间件
export default function cacheMiddleware(options: { enabled?: boolean; ttl?: number } = {}) {
  const { enabled = true, ttl = 60 * 1000 } = options;

  // 如果缓存未启用，则跳过
  if (!enabled) {
    return async (ctx: Context, next: Next) => {
      await next();
    };
  }

  return async (ctx: Context, next: Next) => {
    // 如果请求不可缓存，则跳过
    if (!isCacheable(ctx)) {
      return await next();
    }

    const cacheKey = generateCacheKey(ctx);

    // 尝试从缓存获取
    const cachedResponse = pageCache.get<{
      status: number;
      type: string;
      body: string;
      headers: Record<string, string>;
    }>(cacheKey);

    if (cachedResponse) {
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
        pageCache.set(cacheKey, {
          status: ctx.status,
          type: ctx.type,
          body: ctx.body,
          headers
        }, ttl);
      }
    }
  };
}