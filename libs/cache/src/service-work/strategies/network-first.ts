/**
 * Network First 缓存策略
 * 优先从网络获取，网络请求失败时才从缓存获取
 */
import { CacheStrategyOptions } from '../types';
import { CacheManager } from '../core/cache-manager';

/**
 * Network First 缓存策略
 * 优先从网络获取，网络请求失败时才从缓存获取
 *
 * 适用场景：
 * - 需要实时性的API请求
 * - 频繁更新的内容
 * - 有网络时希望获取最新数据，但也需要离线支持
 *
 * @param request 请求对象
 * @param options 缓存策略选项
 * @returns Promise<Response>
 */
export async function networkFirst(
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> {
  const cacheManager = new CacheManager(options);

  // 设置请求超时
  const networkTimeoutMs = options.networkTimeoutMs || 3000;

  try {
    // 创建一个带超时的网络请求
    const networkPromise = new Promise<Response>(async (resolve, reject) => {
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

        // 如果网络请求成功，将响应存入缓存
        if (networkResponse.ok) {
          await cacheManager.put(request, networkResponse.clone());
        }

        resolve(networkResponse);
      } catch (error) {
        reject(error);
      }
    });

    // 创建超时Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`网络请求超时: ${request.url}`));
      }, networkTimeoutMs);
    });

    // 使用Promise.race实现超时控制
    return await Promise.race([networkPromise, timeoutPromise]);
  } catch (error) {
    console.log(`[SW] 网络请求失败，回退到缓存: ${request.url}`, error);

    // 网络请求失败，尝试从缓存获取
    const cachedResponse = await cacheManager.match(request, options.matchOptions);

    // 如果缓存命中，返回缓存的响应
    if (cachedResponse) {
      return cachedResponse;
    }

    // 如果缓存也未命中，抛出错误
    throw new Error(`无法获取资源: ${request.url}`);
  }
}
