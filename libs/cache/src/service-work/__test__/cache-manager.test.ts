import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager } from '../core/cache-manager';
import { MockCache, MockCacheStorage, setupServiceWorkerGlobalScope } from './mocks';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let mockGlobal: ReturnType<typeof setupServiceWorkerGlobalScope>;

  beforeEach(() => {
    // 设置模拟的全局对象
    mockGlobal = setupServiceWorkerGlobalScope();

    // 替换全局对象
    vi.stubGlobal('caches', mockGlobal.caches);
    vi.stubGlobal('self', mockGlobal.self);

    // 创建缓存管理器实例
    cacheManager = new CacheManager({
      cacheName: 'test-cache',
      maxEntries: 3,
      maxAgeMs: 1000 * 60 * 60 // 1小时
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该能够打开缓存', async () => {
    const spy = vi.spyOn(mockGlobal.caches, 'open');

    await cacheManager.openCache();

    expect(spy).toHaveBeenCalledWith('test-cache');
  });

  it('应该能够从缓存中获取响应', async () => {
    const request = new Request('https://example.com/test');
    const expectedResponse = new Response('test data');

    const cache = await mockGlobal.caches.open('test-cache');
    await cache.put(request, expectedResponse);

    const response = await cacheManager.match(request);

    expect(response).toBeDefined();
    expect(await response!.text()).toBe('test data');
  });

  it('应该能够将响应存入缓存', async () => {
    const request = new Request('https://example.com/test');
    const response = new Response('test data');

    await cacheManager.put(request, response);

    const cache = await mockGlobal.caches.open('test-cache');
    const cachedResponse = await cache.match(request);

    expect(cachedResponse).toBeDefined();
    expect(await cachedResponse!.text()).toBe('test data');
  });

  it('应该能够删除缓存项', async () => {
    const request = new Request('https://example.com/test');
    const response = new Response('test data');

    const cache = await mockGlobal.caches.open('test-cache');
    await cache.put(request, response);

    const result = await cacheManager.delete(request);

    expect(result).toBe(true);

    const cachedResponse = await cache.match(request);
    expect(cachedResponse).toBeUndefined();
  });

  it('应该能够清空缓存', async () => {
    const request = new Request('https://example.com/test');
    const response = new Response('test data');

    const cache = await mockGlobal.caches.open('test-cache');
    await cache.put(request, response);

    const result = await cacheManager.clear();

    expect(result).toBe(true);
    expect(await mockGlobal.caches.has('test-cache')).toBe(false);
  });

  it('应该能够获取所有缓存的键', async () => {
    const cache = await mockGlobal.caches.open('test-cache');
    await cache.put('https://example.com/test1', new Response('test data 1'));
    await cache.put('https://example.com/test2', new Response('test data 2'));

    const keys = await cacheManager.keys();

    expect(keys).toHaveLength(2);
    expect(keys).toContain('https://example.com/test1');
    expect(keys).toContain('https://example.com/test2');
  });

  it('应该能够预缓存资源', async () => {
    const entries = [
      { url: 'https://example.com/test1' },
      { url: 'https://example.com/test2', revision: '123' }
    ];

    vi.spyOn(mockGlobal, 'fetch').mockImplementation((request) => {
      return Promise.resolve(new Response('Mock content', { status: 200 }));
    });

    await cacheManager.precache(entries);

    const cache = await mockGlobal.caches.open('test-cache');

    const response1 = await cache.match('https://example.com/test1');
    expect(response1).toBeDefined();
    expect(await response1!.text()).toBe('Mock content');

    const response2 = await cache.match('https://example.com/test2');
    expect(response2).toBeDefined();
    expect(await response2!.text()).toBe('Mock content');
  });

  it('当超过最大条目数时应该删除旧的缓存项', async () => {
    // 模拟时间戳
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now - 3000) // 第一个项目 (最旧)
      .mockReturnValueOnce(now - 2000) // 第二个项目
      .mockReturnValueOnce(now - 1000) // 第三个项目
      .mockReturnValueOnce(now);       // 第四个项目 (最新)

    // 添加4个缓存项 (maxEntries设置为3)
    await cacheManager.put('https://example.com/test1', new Response('test data 1'));
    await cacheManager.put('https://example.com/test2', new Response('test data 2'));
    await cacheManager.put('https://example.com/test3', new Response('test data 3'));
    await cacheManager.put('https://example.com/test4', new Response('test data 4'));

    // 检查最旧的项目是否已被删除
    const cache = await mockGlobal.caches.open('test-cache');
    const response1 = await cache.match('https://example.com/test1');
    const response2 = await cache.match('https://example.com/test2');
    const response3 = await cache.match('https://example.com/test3');
    const response4 = await cache.match('https://example.com/test4');

    expect(response1).toBeUndefined(); // 最旧的项目应该被删除
    expect(response2).toBeDefined();
    expect(response3).toBeDefined();
    expect(response4).toBeDefined();
  });

  it('应该能够清理过期缓存项', async () => {
    // 模拟时间戳
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now - 2 * 60 * 60 * 1000) // 2小时前 (过期)
      .mockReturnValueOnce(now - 30 * 60 * 1000)     // 30分钟前 (未过期)
      .mockReturnValueOnce(now);                     // 当前时间 (用于清理检查)

    // 添加缓存项
    await cacheManager.put('https://example.com/expired', new Response('expired data'));
    await cacheManager.put('https://example.com/fresh', new Response('fresh data'));

    // 清理过期缓存项
    await cacheManager.cleanExpiredItems();

    // 检查结果
    const cache = await mockGlobal.caches.open('test-cache');
    const expiredResponse = await cache.match('https://example.com/expired');
    const freshResponse = await cache.match('https://example.com/fresh');

    expect(expiredResponse).toBeUndefined(); // 过期项目应该被删除
    expect(freshResponse).toBeDefined();      // 新鲜项目应该保留
  });

  it('应该能够获取缓存统计信息', async () => {
    // 添加缓存项
    await cacheManager.put('https://example.com/test1', new Response('test data 1'));
    await cacheManager.put('https://example.com/test2', new Response('test data 2'));

    // 获取统计信息
    const stats = await cacheManager.getStats();

    expect(stats.items).toHaveLength(2);
    expect(stats.items[0].url).toBe('https://example.com/test1');
    expect(stats.items[1].url).toBe('https://example.com/test2');
    expect(stats.size).toBeGreaterThan(0);
  });
});
