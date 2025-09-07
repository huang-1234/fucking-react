import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cacheFirst } from '../strategies/cache-first';
import { networkFirst } from '../strategies/network-first';
import { staleWhileRevalidate } from '../strategies/stale-while-revalidate';
import { cacheOnly } from '../strategies/cache-only';
import { networkOnly } from '../strategies/network-only';
import { setupServiceWorkerGlobalScope } from './mocks';

describe('缓存策略', () => {
  let mockGlobal: ReturnType<typeof setupServiceWorkerGlobalScope>;

  beforeEach(() => {
    // 设置模拟的全局对象
    mockGlobal = setupServiceWorkerGlobalScope();

    // 替换全局对象
    vi.stubGlobal('caches', mockGlobal.caches);
    vi.stubGlobal('self', mockGlobal.self);

    // 重置 fetch 模拟
    vi.spyOn(global, 'fetch').mockImplementation((request) => {
      return Promise.resolve(new Response('Network response', { status: 200 }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cacheFirst', () => {
    it('当缓存命中时应该返回缓存的响应', async () => {
      // 准备缓存数据
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await cacheFirst(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Cached response');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('当缓存未命中时应该从网络获取并缓存响应', async () => {
      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略
      const response = await cacheFirst(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Network response');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // 验证响应已缓存
      const cache = await mockGlobal.caches.open('test-cache');
      const cachedResponse = await cache.match(request);
      expect(cachedResponse).toBeDefined();
      expect(await cachedResponse!.text()).toBe('Network response');
    });

    it('当网络请求失败时应该抛出错误', async () => {
      // 模拟网络请求失败
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略并验证错误
      await expect(cacheFirst(request, { cacheName: 'test-cache' }))
        .rejects.toThrow('网络请求失败: https://example.com/test');
    });
  });

  describe('networkFirst', () => {
    it('应该优先从网络获取响应', async () => {
      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await networkFirst(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Network response');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // 验证响应已缓存
      const newCachedResponse = await cache.match(request);
      expect(await newCachedResponse!.text()).toBe('Network response');
    });

    it('当网络请求失败时应该回退到缓存', async () => {
      // 模拟网络请求失败
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await networkFirst(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Cached response');
    });

    it('当网络请求失败且缓存未命中时应该抛出错误', async () => {
      // 模拟网络请求失败
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略并验证错误
      await expect(networkFirst(request, { cacheName: 'test-cache' }))
        .rejects.toThrow('无法获取资源: https://example.com/test');
    });

    it('应该支持网络请求超时', async () => {
      // 模拟网络请求延迟
      vi.spyOn(global, 'fetch').mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response('Delayed network response'));
          }, 200); // 延迟200ms
        });
      });

      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略（设置100ms超时）
      await expect(networkFirst(request, {
        cacheName: 'test-cache',
        networkTimeoutMs: 100
      })).rejects.toThrow('网络请求超时: https://example.com/test');
    });
  });

  describe('staleWhileRevalidate', () => {
    it('当缓存命中时应该返回缓存的响应并在后台更新缓存', async () => {
      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await staleWhileRevalidate(request, { cacheName: 'test-cache' });

      // 验证立即返回缓存的响应
      expect(await response.text()).toBe('Cached response');

      // 等待后台更新完成
      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证缓存已更新
      const updatedResponse = await cache.match(request);
      expect(await updatedResponse!.text()).toBe('Network response');
    });

    it('当缓存未命中时应该从网络获取并缓存响应', async () => {
      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略
      const response = await staleWhileRevalidate(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Network response');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // 验证响应已缓存
      const cache = await mockGlobal.caches.open('test-cache');
      const cachedResponse = await cache.match(request);
      expect(await cachedResponse!.text()).toBe('Network response');
    });

    it('当禁用后台更新时不应该更新缓存', async () => {
      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略（禁用后台更新）
      const response = await staleWhileRevalidate(request, {
        cacheName: 'test-cache',
        backgroundUpdate: false
      });

      // 验证返回缓存的响应
      expect(await response.text()).toBe('Cached response');

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证缓存未更新
      const updatedResponse = await cache.match(request);
      expect(await updatedResponse!.text()).toBe('Cached response');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('cacheOnly', () => {
    it('当缓存命中时应该返回缓存的响应', async () => {
      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await cacheOnly(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Cached response');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('当缓存未命中时应该抛出错误', async () => {
      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略并验证错误
      await expect(cacheOnly(request, { cacheName: 'test-cache' }))
        .rejects.toThrow('缓存未命中: https://example.com/test');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('networkOnly', () => {
    it('应该只从网络获取响应', async () => {
      // 准备缓存数据和请求
      const request = new Request('https://example.com/test');
      const cachedResponse = new Response('Cached response');
      const cache = await mockGlobal.caches.open('test-cache');
      await cache.put(request, cachedResponse);

      // 执行策略
      const response = await networkOnly(request, { cacheName: 'test-cache' });

      // 验证结果
      expect(await response.text()).toBe('Network response');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // 验证默认情况下不缓存响应
      const newCachedResponse = await cache.match(request);
      expect(newCachedResponse).toEqual(cachedResponse); // 缓存未更新
    });

    it('当启用backgroundUpdate时应该缓存响应', async () => {
      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略（启用后台更新）
      const response = await networkOnly(request, {
        cacheName: 'test-cache',
        backgroundUpdate: true
      });

      // 验证结果
      expect(await response.text()).toBe('Network response');

      // 验证响应已缓存
      const cache = await mockGlobal.caches.open('test-cache');
      const cachedResponse = await cache.match(request);
      expect(await cachedResponse!.text()).toBe('Network response');
    });

    it('当网络请求失败时应该抛出错误', async () => {
      // 模拟网络请求失败
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      // 准备请求
      const request = new Request('https://example.com/test');

      // 执行策略并验证错误
      await expect(networkOnly(request, { cacheName: 'test-cache' }))
        .rejects.toThrow('网络请求失败: https://example.com/test');
    });
  });
});
