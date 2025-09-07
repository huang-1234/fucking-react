/**
 * React Hook for Service Worker 状态管理
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  type IServiceWorkerContext,
  ServiceWorkerStatus,
  ServiceWorkerRegisterOptions
} from '../types';
import {
  registerServiceWorker,
  unregisterServiceWorker
} from '../core/register';
import {
  listenForMessages,
  sendMessage,
  skipWaiting,
  checkForUpdates as checkForUpdatesUtil
} from '../utils/message-bus';
import { MessageType } from '../types';
import React from 'react';

/**
 * Service Worker React Hook
 * 提供Service Worker状态管理和操作方法
 *
 * @param options Service Worker注册选项
 * @returns Service Worker上下文
 */
export function useServiceWorker(
  options: ServiceWorkerRegisterOptions = {}
): IServiceWorkerContext {
  // 状态
  const [status, setStatus] = useState<ServiceWorkerStatus>(ServiceWorkerStatus.PENDING);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 注册Service Worker
  useEffect(() => {
    let mounted = true;

    const register = async () => {
      try {
        const reg = await registerServiceWorker({
          ...options,
          onUpdate: (reg) => {
            if (mounted) {
              setUpdateAvailable(true);
              setStatus(ServiceWorkerStatus.UPDATE_AVAILABLE);
            }

            if (options.onUpdate) {
              options.onUpdate(reg);
            }
          },
          onSuccess: (reg) => {
            if (mounted) {
              setStatus(ServiceWorkerStatus.ACTIVATED);
            }

            if (options.onSuccess) {
              options.onSuccess(reg);
            }
          },
          onError: (err) => {
            if (mounted) {
              setError(err);
              setStatus(ServiceWorkerStatus.ERROR);
            }

            if (options.onError) {
              options.onError(err);
            }
          }
        });

        if (mounted && reg) {
          setRegistration(reg);
          setStatus(ServiceWorkerStatus.REGISTERED);

          // 监听Service Worker状态变化
          if (reg.installing) {
            trackInstallation(reg.installing);
          } else if (reg.waiting) {
            setStatus(ServiceWorkerStatus.UPDATE_AVAILABLE);
            setUpdateAvailable(true);
          } else if (reg.active) {
            setStatus(ServiceWorkerStatus.ACTIVATED);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus(ServiceWorkerStatus.ERROR);
        }
      }
    };

    // 监听Service Worker安装状态
    const trackInstallation = (sw: ServiceWorker) => {
      sw.addEventListener('statechange', () => {
        if (!mounted) return;

        switch (sw.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              setStatus(ServiceWorkerStatus.UPDATE_AVAILABLE);
              setUpdateAvailable(true);
            } else {
              setStatus(ServiceWorkerStatus.INSTALLED);
            }
            break;
          case 'activating':
            setStatus(ServiceWorkerStatus.ACTIVATING);
            break;
          case 'activated':
            setStatus(ServiceWorkerStatus.ACTIVATED);
            break;
          case 'redundant':
            setStatus(ServiceWorkerStatus.REDUNDANT);
            break;
          default:
            break;
        }
      });
    };

    // 监听Service Worker消息
    const unsubscribe = listenForMessages((message) => {
      if (!mounted) return;

      if (message.type === MessageType.UPDATE_FOUND) {
        setUpdateAvailable(true);
        setStatus(ServiceWorkerStatus.UPDATE_AVAILABLE);
      }
    });

    register();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [options]);

  // 更新Service Worker
  const updateServiceWorker = useCallback(() => {
    if (updateAvailable && registration?.waiting) {
      // 发送跳过等待消息
      skipWaiting().catch(err => {
        console.error('[SW] 更新Service Worker失败:', err);
      });
    }
  }, [updateAvailable, registration]);

  // 检查更新
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;

    try {
      // 通过Service Worker注册对象检查更新
      await registration.update();

      // 通过消息总线检查更新
      return await checkForUpdatesUtil();
    } catch (err) {
      console.error('[SW] 检查更新失败:', err);
      return false;
    }
  }, [registration]);

  // 注销Service Worker
  const unregister = useCallback(async (): Promise<boolean> => {
    const result = await unregisterServiceWorker();

    if (result) {
      setRegistration(null);
      setStatus(ServiceWorkerStatus.PENDING);
      setUpdateAvailable(false);
    }

    return result;
  }, []);

  // 构建上下文
  const context = useMemo<IServiceWorkerContext>(() => ({
    status,
    registration,
    updateAvailable,
    updateServiceWorker,
    checkForUpdates,
    unregister,
    error
  }), [
    status,
    registration,
    updateAvailable,
    updateServiceWorker,
    checkForUpdates,
    unregister,
    error
  ]);

  return context;
}

/**
 * Service Worker Provider Props
 */
export interface ServiceWorkerProviderProps {
  options?: ServiceWorkerRegisterOptions;
  children: React.ReactNode;
}

/**
 * Service Worker Context
 */
export const ServiceWorkerContext = React.createContext<IServiceWorkerContext>({} as IServiceWorkerContext);

/**
 * Service Worker Provider
 * 提供Service Worker上下文
 *
 * @param props Provider属性
 * @returns Provider组件
 */
export function ServiceWorkerProvider({ options = {}, children }: ServiceWorkerProviderProps) {
  const context = useServiceWorker(options);
  return (
    <ServiceWorkerContext.Provider value={context} >
      {children}
    </ServiceWorkerContext.Provider>
  )
}

/**
 * Service Worker Context Hook
 * 获取Service Worker上下文
 *
 * @returns Service Worker上下文
 */
export function useServiceWorkerContext(): IServiceWorkerContext {
  const context = React.useContext(ServiceWorkerContext);

  if (!context) {
    throw new Error('useServiceWorkerContext必须在ServiceWorkerProvider内部使用');
  }

  return context;
}
