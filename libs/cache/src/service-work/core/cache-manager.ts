/**
 * 缓存管理器模块
 */
import { CacheStrategyOptions, PrecacheEntry, PrecacheManifest } from '../types';

/**
 * 缓存管理器类
 * 提供缓存操作的高级API
 */
export class CacheManager {
  private cacheName: string;
  private maxEntries?: number;
  private maxAgeMs?: number;

  /**
   * 构造函数
   * @param options 缓存选项
   */
  constructor(options: CacheStrategyOptions) {
    this.cacheName = options.cacheName;
    this.maxEntries = options.maxEntries;
    this.maxAgeMs = options.maxAgeMs;
  }

  /**
   * 打开缓存
   * @returns Promise<Cache>
   */
  async openCache(): Promise<Cache> {
    return await caches.open(this.cacheName);
  }

  /**
   * 从缓存中获取响应
   * @param request 请求对象或URL
   * @param options 缓存匹配选项
   * @returns Promise<Response | undefined>
   */
  async match(request: Request | string, options?: CacheQueryOptions): Promise<Response | undefined> {
    const cache = await this.openCache();
    return await cache.match(request, options);
  }

  /**
   * 将响应存入缓存
   * @param request 请求对象或URL
   * @param response 响应对象
   * @returns Promise<void>
   */
  async put(request: Request | string, response: Response): Promise<void> {
    const cache = await this.openCache();

    // 如果请求是字符串，转换为Request对象
    const requestObj = typeof request === 'string' ? new Request(request) : request;

    // 存入缓存
    await cache.put(requestObj, response.clone());

    // 如果设置了最大条目数，执行清理
    if (this.maxEntries) {
      await this.enforceMaxEntries();
    }

    // 如果设置了最大缓存时间，添加时间戳
    if (this.maxAgeMs) {
      await this.setTimestamp(requestObj.url);
    }
  }

  /**
   * 删除缓存项
   * @param request 请求对象或URL
   * @returns Promise<boolean>
   */
  async delete(request: Request | string): Promise<boolean> {
    const cache = await this.openCache();
    return await cache.delete(request);
  }

  /**
   * 清空缓存
   * @returns Promise<boolean>
   */
  async clear(): Promise<boolean> {
    return await caches.delete(this.cacheName);
  }

  /**
   * 获取所有缓存的键
   * @returns Promise<string[]>
   */
  async keys(): Promise<string[]> {
    const cache = await this.openCache();
    const requests = await cache.keys();
    return requests.map(request => request.url);
  }

  /**
   * 预缓存资源
   * @param entries 预缓存条目列表
   * @returns Promise<void>
   */
  async precache(entries: PrecacheEntry[]): Promise<void> {
    const cache = await this.openCache();

    // 并行处理所有预缓存请求
    await Promise.all(
      entries.map(async (entry) => {
        try {
          const request = new Request(entry.url);
          const response = await fetch(request);

          if (!response.ok) {
            throw new Error(`预缓存请求失败: ${entry.url}`);
          }

          // 存入缓存
          await cache.put(request, response.clone());

          // 如果有revision，存储版本信息
          if (entry.revision) {
            await this.setMetadata(entry.url, { revision: entry.revision });
          }

          console.log(`[SW] 预缓存成功: ${entry.url}`);
        } catch (error) {
          console.error(`[SW] 预缓存失败: ${entry.url}`, error);
        }
      })
    );
  }

  /**
   * 设置缓存项元数据
   * @param url URL
   * @param metadata 元数据
   * @returns Promise<void>
   */
  private async setMetadata(url: string, metadata: Record<string, any>): Promise<void> {
    const metadataCache = await caches.open(`${this.cacheName}-metadata`);
    const metadataResponse = new Response(JSON.stringify(metadata));
    await metadataCache.put(new Request(`metadata:${url}`), metadataResponse);
  }

  /**
   * 获取缓存项元数据
   * @param url URL
   * @returns Promise<Record<string, any> | null>
   */
  private async getMetadata(url: string): Promise<Record<string, any> | null> {
    try {
      const metadataCache = await caches.open(`${this.cacheName}-metadata`);
      const metadataResponse = await metadataCache.match(new Request(`metadata:${url}`));

      if (metadataResponse) {
        return JSON.parse(await metadataResponse.text());
      }
    } catch (error) {
      console.error(`[SW] 获取元数据失败: ${url}`, error);
    }

    return null;
  }

  /**
   * 设置缓存项时间戳
   * @param url URL
   * @returns Promise<void>
   */
  private async setTimestamp(url: string): Promise<void> {
    const metadata = await this.getMetadata(url) || {};
    metadata.timestamp = Date.now();
    await this.setMetadata(url, metadata);
  }

  /**
   * 获取缓存项时间戳
   * @param url URL
   * @returns Promise<number | null>
   */
  private async getTimestamp(url: string): Promise<number | null> {
    const metadata = await this.getMetadata(url);
    return metadata?.timestamp || null;
  }

  /**
   * 强制执行最大条目数限制
   * @returns Promise<void>
   */
  private async enforceMaxEntries(): Promise<void> {
    if (!this.maxEntries) return;

    const cache = await this.openCache();
    const requests = await cache.keys();

    if (requests.length <= this.maxEntries) return;

    // 获取所有缓存项的时间戳
    const urlsWithTimestamps = await Promise.all(
      requests.map(async (request) => {
        const timestamp = await this.getTimestamp(request.url) || 0;
        return { url: request.url, request, timestamp };
      })
    );

    // 按时间戳排序（最旧的在前）
    urlsWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);

    // 删除多余的缓存项
    const itemsToDelete = urlsWithTimestamps.slice(0, requests.length - this.maxEntries);

    await Promise.all(
      itemsToDelete.map(async (item) => {
        await cache.delete(item.request);
        console.log(`[SW] 删除过期缓存项: ${item.url}`);

        // 同时删除元数据
        const metadataCache = await caches.open(`${this.cacheName}-metadata`);
        await metadataCache.delete(new Request(`metadata:${item.url}`));
      })
    );
  }

  /**
   * 清理过期缓存项
   * @returns Promise<void>
   */
  async cleanExpiredItems(): Promise<void> {
    if (!this.maxAgeMs) return;

    const now = Date.now();
    const cache = await this.openCache();
    const requests = await cache.keys();

    await Promise.all(
      requests.map(async (request) => {
        const timestamp = await this.getTimestamp(request.url);

        // 如果没有时间戳或已过期，则删除
        if (!timestamp || now - timestamp > this.maxAgeMs!) {
          await cache.delete(request);
          console.log(`[SW] 删除过期缓存项: ${request.url}`);

          // 同时删除元数据
          const metadataCache = await caches.open(`${this.cacheName}-metadata`);
          await metadataCache.delete(new Request(`metadata:${request.url}`));
        }
      })
    );
  }

  /**
   * 获取缓存统计信息
   * @returns Promise<{ size: number, items: { url: string, size: number, timestamp: number | null }[] }>
   */
  async getStats(): Promise<{
    size: number,
    items: { url: string, size: number, timestamp: number | null }[]
  }> {
    const cache = await this.openCache();
    const requests = await cache.keys();

    let totalSize = 0;
    const items = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request);
        const timestamp = await this.getTimestamp(request.url);

        let size = 0;
        if (response && response.body) {
          // 获取响应大小
          const clone = response.clone();
          const blob = await clone.blob();
          size = blob.size;
          totalSize += size;
        }

        return {
          url: request.url,
          size,
          timestamp
        };
      })
    );

    return {
      size: totalSize,
      items
    };
  }
}
