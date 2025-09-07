import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handleInstall, handleActivate, createServiceWorkerTemplate } from '../core/lifecycle';
import { MockExtendableEvent, setupServiceWorkerGlobalScope } from './mocks';

describe('Service Worker 生命周期', () => {
  let mockGlobal: ReturnType<typeof setupServiceWorkerGlobalScope>;

  beforeEach(() => {
    // 设置模拟的全局对象
    mockGlobal = setupServiceWorkerGlobalScope();

    // 替换全局对象
    vi.stubGlobal('caches', mockGlobal.caches);
    vi.stubGlobal('self', mockGlobal.self);

    // 重置 fetch 模拟
    vi.spyOn(global, 'fetch').mockImplementation((request) => {
      return Promise.resolve(new Response('Mock content', { status: 200 }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleInstall', () => {
    it('应该跳过等待阶段', () => {
      const event = new MockExtendableEvent('install');

      handleInstall(event as any);

      expect(mockGlobal.skipWaiting).toHaveBeenCalled();
    });

    it('当提供预缓存清单时应该预缓存资源', async () => {
      const event = new MockExtendableEvent('install');
      const precacheManifest = {
        cacheName: 'precache-test',
        entries: [
          { url: 'https://example.com/index.html' },
          { url: 'https://example.com/styles.css' }
        ]
      };

      handleInstall(event as any, precacheManifest);

      // 等待waitUntil完成
      await event.resolveWaitUntil();

      // 验证资源已缓存
      const cache = await mockGlobal.caches.open('precache-test');
      const response1 = await cache.match('https://example.com/index.html');
      const response2 = await cache.match('https://example.com/styles.css');

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
      expect(await response1!.text()).toBe('Mock content');
      expect(await response2!.text()).toBe('Mock content');
    });

    it('当预缓存请求失败时应该继续处理其他请求', async () => {
      const event = new MockExtendableEvent('install');
      const precacheManifest = {
        cacheName: 'precache-test',
        entries: [
          { url: 'https://example.com/success.html' },
          { url: 'https://example.com/fail.css' }
        ]
      };

      // 模拟一个请求失败
      vi.spyOn(global, 'fetch').mockImplementation((request) => {
        const url = typeof request === 'string' ? request : request.url;
        if (url.includes('fail')) {
          return Promise.resolve(new Response('Not found', { status: 404 }));
        }
        return Promise.resolve(new Response('Mock content', { status: 200 }));
      });

      // 捕获控制台错误
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleInstall(event as any, precacheManifest);

      // 等待waitUntil完成
      await event.resolveWaitUntil();

      // 验证成功的请求已缓存
      const cache = await mockGlobal.caches.open('precache-test');
      const successResponse = await cache.match('https://example.com/success.html');
      const failResponse = await cache.match('https://example.com/fail.css');

      expect(successResponse).toBeDefined();
      expect(failResponse).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('handleActivate', () => {
    it('应该清理不在白名单中的缓存', async () => {
      // 创建一些测试缓存
      await mockGlobal.caches.open('keep-cache');
      await mockGlobal.caches.open('delete-cache-1');
      await mockGlobal.caches.open('delete-cache-2');

      const event = new MockExtendableEvent('activate');
      const cacheWhitelist = ['keep-cache'];

      handleActivate(event as any, cacheWhitelist);

      // 等待waitUntil完成
      await event.resolveWaitUntil();

      // 验证缓存清理结果
      const cacheNames = await mockGlobal.caches.keys();
      expect(cacheNames).toContain('keep-cache');
      expect(cacheNames).not.toContain('delete-cache-1');
      expect(cacheNames).not.toContain('delete-cache-2');
    });

    it('应该控制所有客户端', async () => {
      const event = new MockExtendableEvent('activate');

      handleActivate(event as any);

      // 等待waitUntil完成
      await event.resolveWaitUntil();

      // 验证clients.claim被调用
      expect(mockGlobal.clients.claim).toHaveBeenCalled();
    });
  });

  describe('createServiceWorkerTemplate', () => {
    it('应该创建包含正确配置的Service Worker脚本模板', () => {
      const template = createServiceWorkerTemplate({
        version: '1.0.0',
        cacheName: 'test-cache',
        precacheAssets: ['/index.html', '/styles.css'],
        cacheWhitelist: ['other-cache'],
        enableNavigationPreload: true,
        offlineFallbackUrl: '/offline.html'
      });

      // 验证模板包含关键配置
      expect(template).toContain('版本: 1.0.0');
      expect(template).toContain("const CACHE_NAME = 'test-cache-1.0.0'");
      expect(template).toContain("const CACHE_WHITELIST = ['test-cache-1.0.0', 'other-cache']");
      expect(template).toContain("'/index.html'");
      expect(template).toContain("'/styles.css'");
      expect(template).toContain("'/offline.html'");
      expect(template).toContain('self.skipWaiting()');
      expect(template).toContain('self.clients.claim()');
      expect(template).toContain('navigationPreload.enable()');
    });

    it('应该根据选项禁用导航预加载', () => {
      const template = createServiceWorkerTemplate({
        version: '1.0.0',
        cacheName: 'test-cache',
        enableNavigationPreload: false
      });

      // 验证模板不包含导航预加载代码
      expect(template).not.toContain('navigationPreload.enable()');
    });
  });
});
