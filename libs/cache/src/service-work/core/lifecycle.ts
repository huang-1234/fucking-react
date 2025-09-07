/**
 * Service Worker生命周期管理模块
 */
import { PrecacheManifest, ServiceWorkerGlobalScope } from '../types';
export interface ExtendableEvent {
  waitUntil(promise: Promise<void>): void;
  clients: {
    claim(): Promise<void>;
  };
}
/**
 * 处理Service Worker安装事件
 * @param event 安装事件
 * @param precacheManifest 预缓存清单
 */
export function handleInstall(event: ExtendableEvent, precacheManifest?: PrecacheManifest): void {
  // 跳过等待阶段，立即激活
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();

  if (precacheManifest) {
    // 预缓存关键资源
    event.waitUntil(
      (async () => {
        const cache = await caches.open(precacheManifest.cacheName);

        // 缓存所有预缓存条目
        const cachePromises = precacheManifest.entries.map(async (entry) => {
          const request = new Request(entry.url);
          try {
            const response = await fetch(request);
            if (!response.ok) {
              throw new Error(`预缓存请求失败: ${entry.url}`);
            }

            // 存储响应到缓存
            await cache.put(request, response.clone());
            console.log(`[SW] 预缓存成功: ${entry.url}`);
          } catch (error) {
            console.error(`[SW] 预缓存失败: ${entry.url}`, error);
          }
        });

        await Promise.all(cachePromises);
        console.log('[SW] 预缓存完成');
      })()
    );
  }
}

/**
 * 处理Service Worker激活事件
 * @param event 激活事件
 * @param cacheWhitelist 缓存白名单
 */
export function handleActivate(event: ExtendableEvent, cacheWhitelist: string[] = []): void {
  // 清理旧缓存
  event.waitUntil(
    (async () => {
      // 获取所有缓存名称
      const cacheNames = await caches.keys();

      // 删除不在白名单中的缓存
      const deletePromises = cacheNames.map(async (cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log(`[SW] 删除旧缓存: ${cacheName}`);
          return caches.delete(cacheName);
        }
      });

      await Promise.all(deletePromises);
      console.log('[SW] 缓存清理完成');

      // 立即控制所有客户端
      await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })()
  );
}

/**
 * 创建Service Worker脚本模板
 * @param options 模板选项
 * @returns Service Worker脚本内容
 */
export function createServiceWorkerTemplate(options: {
  version: string;
  cacheName: string;
  precacheAssets?: string[];
  cacheWhitelist?: string[];
  enableNavigationPreload?: boolean;
  offlineFallbackUrl?: string;
}): string {
  const {
    version,
    cacheName,
    precacheAssets = [],
    cacheWhitelist = [],
    enableNavigationPreload = true,
    offlineFallbackUrl = '/offline.html'
  } = options;

  return `
    /**
     * 增强版Service Worker
     * 版本: ${version}
     * 生成时间: ${new Date().toISOString()}
     */

    // 缓存名称
    const CACHE_NAME = '${cacheName}-${version}';

    // 缓存白名单
    const CACHE_WHITELIST = ['${cacheName}-${version}', ${cacheWhitelist.map(name => `'${name}'`).join(', ')}];

    // 预缓存资源
    const PRECACHE_ASSETS = [
      '${offlineFallbackUrl}',
      ${precacheAssets.map(asset => `'${asset}'`).join(',\n      ')}
    ];

    // 安装事件
    self.addEventListener('install', (event) => {
      console.log('[SW] 安装');

      // 跳过等待阶段
      (self as unknown as ServiceWorkerGlobalScope).skipWaiting();

      // 预缓存关键资源
      event.waitUntil(
        (async () => {
          const cache = await caches.open(CACHE_NAME);
          console.log('[SW] 缓存打开');
          return cache.addAll(PRECACHE_ASSETS);
        })()
      );
    });

    // 激活事件
    self.addEventListener('activate', (event) => {
      console.log('[SW] 激活');

      // 清理旧缓存
      event.waitUntil(
        (async () => {
          // 获取所有缓存名称
          const cacheNames = await caches.keys();

          // 删除不在白名单中的缓存
          const deletePromises = cacheNames.map(async (name) => {
            if (!CACHE_WHITELIST.includes(name)) {
              console.log(\`[SW] 删除旧缓存: \${name}\`);
              return caches.delete(name);
            }
          });

          await Promise.all(deletePromises);

          ${enableNavigationPreload ? `
          // 启用导航预加载
          if (self.registration.navigationPreload) {
            await self.registration.navigationPreload.enable();
            console.log('[SW] 导航预加载已启用');
          }
          ` : ''}

          // 立即控制所有客户端
          await self.clients.claim();
          return true;
        })()
      );
    });

    // 消息事件
    self.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] 跳过等待');
        (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
      }
    });

    // 请求拦截
    self.addEventListener('fetch', (event) => {
      // 只处理GET请求
      if (event.request.method !== 'GET') return;

      // 处理导航请求
      if (event.request.mode === 'navigate') {
        event.respondWith(
          (async () => {
            try {
              // 尝试使用导航预加载响应
              ${enableNavigationPreload ? `
              const preloadResponse = await event.preloadResponse;
              if (preloadResponse) {
                console.log('[SW] 使用导航预加载');
                return preloadResponse;
              }
              ` : ''}

              // 尝试从网络获取
              return await fetch(event.request);
            } catch (error) {
              // 网络请求失败，回退到缓存
              const cache = await caches.open(CACHE_NAME);
              const cachedResponse = await cache.match(event.request);

              if (cachedResponse) {
                return cachedResponse;
              }

              // 如果缓存中也没有，返回离线页面
              return await cache.match('${offlineFallbackUrl}');
            }
          })()
        );
        return;
      }

      // 处理静态资源请求
      if (event.request.url.match(/\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        event.respondWith(
          (async () => {
            // 先查缓存
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);

            if (cachedResponse) {
              // 后台更新缓存
              fetch(event.request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    cache.put(event.request, networkResponse);
                  }
                })
                .catch(() => {});

              return cachedResponse;
            }

            // 缓存未命中，从网络获取
            try {
              const networkResponse = await fetch(event.request);
              if (networkResponse.ok) {
                // 存入缓存
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            } catch (error) {
              // 网络请求失败，无法提供响应
              console.error('[SW] 资源获取失败:', error);
              return new Response('Network error', { status: 408, statusText: 'Network error' });
            }
          })()
        );
        return;
      }

      // 处理API请求
      if (event.request.url.includes('/api/')) {
        event.respondWith(
          (async () => {
            try {
              // 优先从网络获取
              const networkResponse = await fetch(event.request);

              // 如果成功，存入缓存
              if (networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
              }

              return networkResponse;
            } catch (error) {
              // 网络请求失败，回退到缓存
              const cache = await caches.open(CACHE_NAME);
              const cachedResponse = await cache.match(event.request);

              if (cachedResponse) {
                return cachedResponse;
              }

              // 如果缓存中也没有，返回错误响应
              return new Response(JSON.stringify({ error: 'Network error' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          })()
        );
      }
    });
  `;
}
