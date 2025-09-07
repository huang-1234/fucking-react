/**
 * Service Worker注册模块
 */
import { ServiceWorkerRegisterOptions, ServiceWorkerStatus } from '../types';
import { sendMessage } from '../utils/message-bus';
import { MessageType } from '../types';

const DEFAULT_OPTIONS: ServiceWorkerRegisterOptions = {
  swPath: '/service-worker.js',
  enableInDev: false,
  scope: '/',
  autoSkipWaiting: true,
  debug: false,
};

/**
 * 注册Service Worker
 * @param options 注册选项
 * @returns Promise<ServiceWorkerRegistration | null>
 */
export async function registerServiceWorker(
  options: ServiceWorkerRegisterOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { swPath, enableInDev, scope, debug, onUpdate, onSuccess, onError } = mergedOptions;

  // 检查浏览器支持
  if (!('serviceWorker' in navigator)) {
    const error = new Error('浏览器不支持Service Worker');
    if (onError) onError(error);
    if (debug) console.error('[SW]', error);
    return null;
  }

  // 开发环境检查
  if (process.env.NODE_ENV === 'development' && !enableInDev) {
    if (debug) console.log('[SW] 开发环境下Service Worker已禁用。设置enableInDev=true可启用。');
    return null;
  }

  try {
    // 注册Service Worker
    const registration = await navigator.serviceWorker.register(swPath || '/service-worker.js', { scope });
    if (debug) console.log('[SW] 注册成功:', registration);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (debug) console.log('[SW] Service Worker状态变化:', newWorker.state);

        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 有新版本可用
          if (debug) console.log('[SW] 新版本可用');

          // 发送更新通知
          if (onUpdate) onUpdate(registration);

          // 发送消息到客户端
          sendMessage({
            type: MessageType.UPDATE_FOUND,
            payload: { timestamp: Date.now() },
            meta: {
              timestamp: Date.now(),
              source: 'client',
            },
          });

          // 自动跳过等待
          if (mergedOptions.autoSkipWaiting) {
            sendMessage({
              type: MessageType.SKIP_WAITING,
              meta: {
                timestamp: Date.now(),
                source: 'client',
              },
            });
          }
        } else if (newWorker.state === 'activated') {
          // 激活成功
          if (debug) console.log('[SW] Service Worker激活成功');
          if (onSuccess) onSuccess(registration);
        }
      });
    });

    return registration;
  } catch (error) {
    if (onError) onError(error as Error);
    if (debug) console.error('[SW] 注册失败:', error);
    return null;
  }
}

/**
 * 注销Service Worker
 * @returns Promise<boolean>
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    return result;
  } catch (error) {
    console.error('[SW] 注销失败:', error);
    return false;
  }
}