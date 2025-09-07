/**
 * Network Only 缓存策略
 * 仅从网络获取，不使用缓存
 */
import { CacheStrategyOptions } from '../types';
import { CacheManager } from '../core/cache-manager';

/**
 * Network Only 缓存策略
 * 仅从网络获取，不使用缓存
 *
 * 适用场景：
 * - 需要实时数据的API请求
 * - 不希望使用缓存的资源
 * - 用户登录等敏感操作
 *
 * @param request 请求对象
 * @param options 缓存策略选项
 * @returns Promise<Response>
 */
export async function networkOnly(
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> {
  const cacheManager = new CacheManager(options);

  try {
    // 添加自定义请求头（如果有）
    let requestToFetch = request.clone();
    if (options.headers) {
      const newHeaders = new Headers(request.headers);
      Object.entries(options.headers).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      requestToFetch = new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
      });
    }

    // 发起网络请求
    const networkResponse = await fetch(requestToFetch);

    // 如果配置了缓存，则将响应存入缓存（虽然策略是网络优先，但可能需要作为后备）
    if (networkResponse.ok && options.backgroundUpdate) {
      await cacheManager.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 网络请求失败，抛出错误
    throw new Error(`网络请求失败: ${request.url}`);
  }
}
