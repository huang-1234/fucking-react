/**
 * Cache First 缓存策略
 * 优先从缓存获取，缓存未命中时才从网络获取
 */
import { CacheStrategyOptions } from '../types';
import { CacheManager } from '../core/cache-manager';

/**
 * Cache First 缓存策略
 * 优先从缓存获取，缓存未命中时才从网络获取
 *
 * 适用场景：
 * - 静态资源（JS、CSS、图片等）
 * - 很少变化的API响应
 * - 离线优先应用
 *
 * @param request 请求对象
 * @param options 缓存策略选项
 * @returns Promise<Response>
 */
export async function cacheFirst(
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> {
  const cacheManager = new CacheManager(options);

  // 尝试从缓存获取响应
  const cachedResponse = await cacheManager.match(request, options.matchOptions);

  // 如果缓存命中，直接返回缓存的响应
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request.clone());

    // 如果网络请求成功，将响应存入缓存
    if (networkResponse.ok) {
      await cacheManager.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 网络请求失败，抛出错误
    throw new Error(`网络请求失败: ${request.url}`);
  }
}
