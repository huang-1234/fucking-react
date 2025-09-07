/**
 * Service Worker 消息总线
 * 用于Service Worker和客户端之间的通信
 */
import { Client, MessageType, ServiceWorkerGlobalScope, ServiceWorkerMessage } from '../types';

/**
 * 发送消息到Service Worker
 * @param message 消息对象
 * @returns Promise<any> 消息响应
 */
export async function sendMessage(message: ServiceWorkerMessage): Promise<any> {
  // 确保消息有元数据
  if (!message.meta) {
    message.meta = {
      timestamp: Date.now(),
      source: 'client'
    };
  }

  // 检查Service Worker是否已注册
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn('[SW] 无法发送消息：Service Worker未注册或未激活');
    return null;
  }

  try {
    // 创建消息通道
    const messageChannel = new MessageChannel();

    // 创建Promise等待响应
    const responsePromise = new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
    });

    // 发送消息
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

    // 等待响应
    return await responsePromise;
  } catch (error) {
    console.error('[SW] 发送消息失败:', error);
    return null;
  }
}

/**
 * 监听来自Service Worker的消息
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function listenForMessages(
  callback: (message: ServiceWorkerMessage) => void
): () => void {
  const messageHandler = (event: MessageEvent) => {
    // 确保消息是有效的ServiceWorkerMessage
    if (event.data && event.data.type) {
      callback(event.data);
    }
  };

  // 添加消息监听器
  navigator.serviceWorker.addEventListener('message', messageHandler);

  // 返回取消监听的函数
  return () => {
    navigator.serviceWorker.removeEventListener('message', messageHandler);
  };
}

/**
 * 请求Service Worker跳过等待阶段
 * @returns Promise<boolean> 是否成功
 */
export async function skipWaiting(): Promise<boolean> {
  return await sendMessage({
    type: MessageType.SKIP_WAITING,
    meta: {
      timestamp: Date.now(),
      source: 'client'
    }
  });
}

/**
 * 请求Service Worker检查更新
 * @returns Promise<boolean> 是否有更新
 */
export async function checkForUpdates(): Promise<boolean> {
  return await sendMessage({
    type: MessageType.CHECK_FOR_UPDATES,
    meta: {
      timestamp: Date.now(),
      source: 'client'
    }
  });
}

/**
 * 获取缓存统计信息
 * @returns Promise<any> 缓存统计信息
 */
export async function getCacheStats(): Promise<any> {
  return await sendMessage({
    type: MessageType.CACHE_STATS,
    meta: {
      timestamp: Date.now(),
      source: 'client'
    }
  });
}

/**
 * Service Worker消息处理器
 * 用于在Service Worker中处理来自客户端的消息
 */
export class ServiceWorkerMessageHandler {
  private handlers: Map<MessageType, (data: any) => Promise<any>>;

  constructor() {
    this.handlers = new Map();

    // 注册默认处理器
    this.registerHandler(MessageType.SKIP_WAITING, async () => {
      // 由于 TypeScript 在非 Service Worker 环境下 self 可能没有 skipWaiting 方法，需要类型断言
      // 修复：显式声明 ServiceWorkerGlobalScope 类型，避免找不到类型错误
      (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
      return true;
    });

    this.registerHandler(MessageType.CLIENTS_CLAIM, async () => {
      await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
      return true;
    });
  }

  /**
   * 注册消息处理器
   * @param type 消息类型
   * @param handler 处理函数
   */
  registerHandler(type: MessageType, handler: (data: any) => Promise<any>): void {
    this.handlers.set(type, handler);
  }

  /**
   * 初始化消息监听
   */
  init(): void {
    self.addEventListener('message', async (event) => {
      // 确保消息是有效的ServiceWorkerMessage
      if (!event.data || !event.data.type) return;

      const message = event.data as ServiceWorkerMessage;
      const { type, payload } = message;

      // 查找对应的处理器
      const handler = this.handlers.get(type);

      if (handler && event.ports && event.ports[0]) {
        try {
          // 执行处理器
          const result = await handler(payload);

          // 返回结果
          event.ports[0].postMessage(result);
        } catch (error) {
          // 返回错误
          event.ports[0].postMessage({
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    });
  }

  /**
   * 向所有客户端广播消息
   * @param message 消息对象
   */
  async broadcast(message: ServiceWorkerMessage): Promise<void> {
    // 确保消息有元数据
    if (!message.meta) {
      message.meta = {
        timestamp: Date.now(),
        source: 'service-worker'
      };
    }

    // 获取所有客户端
    const clients = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll();

    // 向每个客户端发送消息
    clients.forEach((client: Client) => {
      client.postMessage(message);
    });
  }
}
