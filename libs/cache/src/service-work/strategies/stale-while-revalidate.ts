/**
 * Stale While Revalidate 缓存策略
 * 先返回缓存（即使是旧的），同时在后台更新缓存
 */
import { CacheStrategyOptions } from '../types';
import { CacheManager } from '../core/cache-manager';

/**
 * Stale While Revalidate 缓存策略
 * 先返回缓存（即使是旧的），同时在后台更新缓存
 *
 * 适用场景：
 * - 需要快速响应但又希望保持数据新鲜度的API请求
 * - 可以容忍短时间内展示旧数据的场景
 * - 提升用户体验的同时确保数据最终会更新
 *
 * @param request 请求对象
 * @param options 缓存策略选项
 * @returns Promise<Response>
 */
export async function staleWhileRevalidate(
  request: Request,
  options: CacheStrategyOptions
): Promise<Response> {
  const cacheManager = new CacheManager(options);

  // 尝试从缓存获取响应
  const cachedResponse = await cacheManager.match(request, options.matchOptions);

  // 创建后台更新Promise
  const backgroundUpdate = (async () => {
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
        console.log(`[SW] 后台更新缓存成功: ${request.url}`);
      }
    } catch (error) {
      console.error(`[SW] 后台更新缓存失败: ${request.url}`, error);
    }
  })();

  // 如果缓存命中，返回缓存的响应，同时在后台更新缓存
  if (cachedResponse) {
    // 在后台执行更新，不等待其完成
    if (options.backgroundUpdate !== false) {
      backgroundUpdate.catch(error => {
        console.error('[SW] 后台更新出错:', error);
      });
    }

    return cachedResponse;
  }

  // 缓存未命中，从网络获取
  try {
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
