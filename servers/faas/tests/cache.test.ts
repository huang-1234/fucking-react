/**
 * 缓存工具测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCache } from '../src/server/utils/cache';

// 模拟Date.now
const mockNow = vi.spyOn(Date, 'now');

describe('缓存工具测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNow.mockReset();
    // 设置初始时间
    mockNow.mockReturnValue(1000);
  });

  it('应该能存取缓存项', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 10
    });

    await cache.set('key1', 'value1');
    const value = await cache.get('key1');

    expect(value).toBe('value1');
  });

  it('应该返回null当获取不存在的键', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 10
    });

    const value = await cache.get('nonexistent');

    expect(value).toBeNull();
  });

  it('应该尊重TTL过期时间', async () => {
    const cache = createCache({
      ttl: 1000, // 1秒过期
      maxSize: 10
    });

    // 设置初始时间为1000ms
    mockNow.mockReturnValue(1000);

    await cache.set('key1', 'value1');

    // 前进500ms，未过期
    mockNow.mockReturnValue(1500);
    let value = await cache.get('key1');
    expect(value).toBe('value1');

    // 前进到2001ms，已过期
    mockNow.mockReturnValue(2001);
    value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('应该尊重自定义TTL', async () => {
    const cache = createCache({
      ttl: 1000, // 默认1秒过期
      maxSize: 10
    });

    // 设置初始时间为1000ms
    mockNow.mockReturnValue(1000);

    // 使用自定义TTL 2000ms
    await cache.set('key1', 'value1', 2000);

    // 前进1500ms，默认TTL会过期，但自定义TTL未过期
    mockNow.mockReturnValue(2500);
    let value = await cache.get('key1');
    expect(value).toBe('value1');

    // 前进到3001ms，已过期
    mockNow.mockReturnValue(3001);
    value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('应该尊重最大缓存大小限制', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 2 // 最多存2项
    });

    // 设置初始时间
    mockNow.mockReturnValue(1000);

    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    // 验证两个键都存在
    expect(await cache.get('key1')).toBe('value1');
    expect(await cache.get('key2')).toBe('value2');

    // 访问key1，使其成为最近使用的
    mockNow.mockReturnValue(1100);
    await cache.get('key1');

    // 添加第三个键，应该淘汰最久未使用的key2
    mockNow.mockReturnValue(1200);
    await cache.set('key3', 'value3');

    // key1应该还在，key2应该被淘汰
    expect(await cache.get('key1')).toBe('value1');
    expect(await cache.get('key2')).toBeNull();
    expect(await cache.get('key3')).toBe('value3');
  });

  it('应该能删除缓存项', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 10
    });

    await cache.set('key1', 'value1');
    expect(await cache.get('key1')).toBe('value1');

    await cache.delete('key1');
    expect(await cache.get('key1')).toBeNull();
  });

  it('应该能清空缓存', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 10
    });

    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    await cache.clear();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });

  it('应该能提供正确的缓存统计', async () => {
    const cache = createCache({
      ttl: 1000,
      maxSize: 10
    });

    // 初始状态
    let stats = await cache.stats();
    expect(stats).toEqual({
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    });

    // 添加项并命中
    await cache.set('key1', 'value1');
    await cache.get('key1'); // 命中
    await cache.get('key2'); // 未命中

    stats = await cache.stats();
    expect(stats).toEqual({
      hits: 1,
      misses: 1,
      size: 1,
      hitRate: 0.5
    });
  });

  it('应该支持命名空间', async () => {
    const cache1 = createCache({
      ttl: 1000,
      maxSize: 10,
      namespace: 'ns1'
    });

    const cache2 = createCache({
      ttl: 1000,
      maxSize: 10,
      namespace: 'ns2'
    });

    await cache1.set('key', 'value1');
    await cache2.set('key', 'value2');

    expect(await cache1.get('key')).toBe('value1');
    expect(await cache2.get('key')).toBe('value2');
  });
});