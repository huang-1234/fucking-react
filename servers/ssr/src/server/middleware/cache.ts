/**
 * 缓存中间件
 * 实现页面级缓存，减轻服务器渲染压力
 */
import { Context, Next } from 'koa';
import { createCache, CacheManager } from '../utils/cache';
import config from '../config';

// 缓存键生成函数
const generateCacheKey = (ctx: Context): string => {
  const { method, url, headers } = ctx.request;
  // 使用请求方法、URL和一些关键请求头作为缓存键
  // 可以根据需要添加更多维度，如用户状态、语言等
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

  // 可以添加更多规则
  return true;
};

// 创建缓存实例
const pageCache: CacheManager = createCache({
  ttl: config.cache.ttl,
  maxSize: config.cache.maxSize,
  namespace: 'page-cache'
});

// 导出缓存实例供其他模块使用
export { pageCache };

// 缓存中间件
export default function cacheMiddleware() {
  // 如果缓存未启用，则跳过
  if (!config.cache.enabled) {
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
    const cachedResponse = await pageCache.get<{
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
        headers[field] = val as string;
      } else if (typeof field === 'object') {
        Object.entries(field).forEach(([key, value]) => {
          headers[key] = Array.isArray(value) ? value[0] : value;
        });
      }
      return originalSetResponse.apply(this, [field as string, val as string]);
    };

    await next();

    // 如果响应成功且是HTML，则缓存响应
    if (ctx.status === 200 && ctx.response.type.includes('html')) {
      // 只缓存字符串类型的响应体
      if (typeof ctx.body === 'string') {
        await pageCache.set(cacheKey, {
          status: ctx.status,
          type: ctx.type,
          body: ctx.body,
          headers
        });
      }
    }
  };
}