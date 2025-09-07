import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { sendMessage, listenForMessages, skipWaiting, checkForUpdates, getCacheStats, ServiceWorkerMessageHandler } from '../utils/message-bus';
import { MessageType } from '../types';
import { MockMessageChannel, MockMessageEvent, setupServiceWorkerGlobalScope } from './mocks';

describe('Service Worker 消息总线', () => {
  // 保存原始 navigator
  const originalNavigator = global.navigator;
  let mockGlobal: ReturnType<typeof setupServiceWorkerGlobalScope>;

  beforeEach(() => {
    // 设置模拟的全局对象
    mockGlobal = setupServiceWorkerGlobalScope();

    // 模拟 navigator.serviceWorker
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          controller: {
            postMessage: vi.fn()
          },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }
      },
      configurable: true
    });

    // 模拟 MessageChannel
    global.MessageChannel = MockMessageChannel as any;

    // 替换全局对象
    vi.stubGlobal('self', mockGlobal.self);
  });

  afterEach(() => {
    // 恢复原始 navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true
    });

    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('应该发送消息并返回响应', async () => {
      // 模拟 postMessage 实现
      (navigator.serviceWorker.controller!.postMessage as any).mockImplementation((message, transfer) => {
        // 模拟Service Worker的响应
        setTimeout(() => {
          const port = transfer[0];
          port.onmessage?.({ data: { success: true } } as any);
        }, 0);
      });

      const result = await sendMessage({
        type: MessageType.SKIP_WAITING
      });

      expect(navigator.serviceWorker.controller!.postMessage).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('当Service Worker未注册时应该返回null', async () => {
      // 模拟Service Worker未注册
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            controller: null
          }
        },
        configurable: true
      });

      const result = await sendMessage({
        type: MessageType.SKIP_WAITING
      });

      expect(result).toBeNull();
    });

    it('应该为消息添加元数据', async () => {
      // 捕获发送的消息
      let capturedMessage: any = null;
      (navigator.serviceWorker.controller!.postMessage as any).mockImplementation((message) => {
        capturedMessage = message;
      });

      await sendMessage({
        type: MessageType.SKIP_WAITING
      });

      expect(capturedMessage.meta).toBeDefined();
      expect(capturedMessage.meta.timestamp).toBeTypeOf('number');
      expect(capturedMessage.meta.source).toBe('client');
    });
  });

  describe('listenForMessages', () => {
    it('应该监听来自Service Worker的消息', () => {
      const callback = vi.fn();

      listenForMessages(callback);

      expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('应该返回取消监听的函数', () => {
      const callback = vi.fn();

      const unsubscribe = listenForMessages(callback);
      unsubscribe();

      expect(navigator.serviceWorker.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('应该过滤无效消息', () => {
      const callback = vi.fn();

      // 获取事件监听器
      listenForMessages(callback);
      const listener = (navigator.serviceWorker.addEventListener as any).mock.calls[0][1];

      // 触发无效消息事件
      listener({ data: null });
      listener({ data: {} });

      expect(callback).not.toHaveBeenCalled();

      // 触发有效消息事件
      listener({ data: { type: MessageType.UPDATE_FOUND } });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ type: MessageType.UPDATE_FOUND });
    });
  });

  describe('辅助函数', () => {
    it('skipWaiting 应该发送跳过等待消息', async () => {
      const sendMessageSpy = vi.spyOn({ sendMessage }, 'sendMessage').mockResolvedValue(true);

      const result = await skipWaiting();

      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: MessageType.SKIP_WAITING,
        meta: expect.objectContaining({
          source: 'client'
        })
      });
      expect(result).toBe(true);
    });

    it('checkForUpdates 应该发送检查更新消息', async () => {
      const sendMessageSpy = vi.spyOn({ sendMessage }, 'sendMessage').mockResolvedValue(true);

      const result = await checkForUpdates();

      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: MessageType.CHECK_FOR_UPDATES,
        meta: expect.objectContaining({
          source: 'client'
        })
      });
      expect(result).toBe(true);
    });

    it('getCacheStats 应该发送获取缓存统计消息', async () => {
      const stats = { size: 1024, items: [] };
      const sendMessageSpy = vi.spyOn({ sendMessage }, 'sendMessage').mockResolvedValue(stats);

      const result = await getCacheStats();

      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: MessageType.CACHE_STATS,
        meta: expect.objectContaining({
          source: 'client'
        })
      });
      expect(result).toBe(stats);
    });
  });

  describe('ServiceWorkerMessageHandler', () => {
    let messageHandler: ServiceWorkerMessageHandler;

    beforeEach(() => {
      messageHandler = new ServiceWorkerMessageHandler();
    });

    it('应该注册默认处理器', () => {
      // 获取内部处理器映射
      const handlers = (messageHandler as any).handlers;

      expect(handlers.has(MessageType.SKIP_WAITING)).toBe(true);
      expect(handlers.has(MessageType.CLIENTS_CLAIM)).toBe(true);
    });

    it('应该能够注册自定义处理器', () => {
      const handler = async () => ({ custom: true });

      messageHandler.registerHandler(MessageType.CACHE_STATS, handler);

      // 获取内部处理器映射
      const handlers = (messageHandler as any).handlers;

      expect(handlers.get(MessageType.CACHE_STATS)).toBe(handler);
    });

    it('init 应该设置消息事件监听器', () => {
      messageHandler.init();

      expect(mockGlobal.self.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('应该处理消息并返回结果', async () => {
      // 注册自定义处理器
      messageHandler.registerHandler(MessageType.CACHE_STATS, async () => ({ count: 5 }));

      // 初始化处理器
      messageHandler.init();

      // 获取消息事件监听器
      const listener = (mockGlobal.self.addEventListener as any).mock.calls[0][1];

      // 创建模拟消息端口
      const port = {
        postMessage: vi.fn()
      };

      // 触发消息事件
      await listener({
        data: {
          type: MessageType.CACHE_STATS,
          payload: {}
        },
        ports: [port]
      });

      // 验证结果
      expect(port.postMessage).toHaveBeenCalledWith({ count: 5 });
    });

    it('应该处理处理器错误', async () => {
      // 注册抛出错误的处理器
      messageHandler.registerHandler(MessageType.CACHE_STATS, async () => {
        throw new Error('处理错误');
      });

      // 初始化处理器
      messageHandler.init();

      // 获取消息事件监听器
      const listener = (mockGlobal.self.addEventListener as any).mock.calls[0][1];

      // 创建模拟消息端口
      const port = {
        postMessage: vi.fn()
      };

      // 触发消息事件
      await listener({
        data: {
          type: MessageType.CACHE_STATS,
          payload: {}
        },
        ports: [port]
      });

      // 验证错误结果
      expect(port.postMessage).toHaveBeenCalledWith({
        error: '处理错误'
      });
    });

    it('broadcast 应该向所有客户端发送消息', async () => {
      // 模拟客户端
      const client1 = { postMessage: vi.fn() };
      const client2 = { postMessage: vi.fn() };

      mockGlobal.clients.matchAll = vi.fn().mockResolvedValue([client1, client2]);

      // 广播消息
      await messageHandler.broadcast({
        type: MessageType.CACHE_UPDATED,
        payload: { updated: true }
      });

      // 验证消息发送
      expect(client1.postMessage).toHaveBeenCalled();
      expect(client2.postMessage).toHaveBeenCalled();

      // 验证消息内容
      const message = client1.postMessage.mock.calls[0][0];
      expect(message.type).toBe(MessageType.CACHE_UPDATED);
      expect(message.payload).toEqual({ updated: true });
      expect(message.meta).toBeDefined();
      expect(message.meta.source).toBe('service-worker');
    });
  });
});
