/**
 * Cache Only 缓存策略
 * 仅从缓存获取，不发起网络请求
 */
import { CacheStrategyOptions } from '../types';
import { CacheManager } from '../core/cache-manager';

/**
 * Cache Only 缓存策略
 * 仅从缓存获取，不发起网络请求
 *
 * 适用场景：
 * - 离线应用中的关键资源
 * - 已预缓存的资源
 * - 完全不需要从网络更新的资源
 *
 * @param request 请求对象
 * @param options 缓存策略选项
 * @returns Promise<Response>
 */
export async function cacheOnly(
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> {
  const cacheManager = new CacheManager(options);

  // 尝试从缓存获取响应
  const cachedResponse = await cacheManager.match(request, options.matchOptions);

  // 如果缓存命中，返回缓存的响应
  if (cachedResponse) {
    return cachedResponse;
  }

  // 缓存未命中，抛出错误
  throw new Error(`缓存未命中: ${request.url}`);
}
