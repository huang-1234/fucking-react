// 注意：虽然暂时没有使用produce，但未来的缓存优化会用到
// import { produce } from 'immer';
import { performanceMonitor } from '../tools/performance';

interface CacheItem {
  content: string;
  timestamp: number;
  html: string;
}

// 默认缓存时间：5分钟
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Markdown渲染缓存工具
 * 用于缓存已渲染的Markdown内容，提高性能
 */
class MarkdownCache {
  private cache: Map<string, CacheItem>;
  private cacheDuration: number;

  constructor(cacheDuration: number = DEFAULT_CACHE_DURATION) {
    this.cache = new Map<string, CacheItem>();
    this.cacheDuration = cacheDuration;
  }

  /**
   * 获取缓存的Markdown HTML
   * @param content Markdown原始内容
   * @returns 缓存的HTML或null（如果缓存不存在或已过期）
   */
  public getCachedMarkdown(content: string): string | null {
    performanceMonitor.start('cache_read');

    const key = this.generateKey(content);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      performanceMonitor.end('cache_read');
      return cached.html;
    }

    performanceMonitor.end('cache_read');
    return null;
  }

  /**
   * 缓存Markdown HTML
   * @param content Markdown原始内容
   * @param html 渲染后的HTML
   */
  public cacheMarkdown(content: string, html: string): void {
    performanceMonitor.start('cache_write');

    // 使用Immer更新缓存Map
    const key = this.generateKey(content);
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      html
    });

    // 清理过期缓存
    this.cleanExpiredCache();

    performanceMonitor.end('cache_write');
  }

  /**
   * 清除所有缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 设置缓存有效期
   * @param duration 缓存有效期（毫秒）
   */
  public setCacheDuration(duration: number): void {
    this.cacheDuration = duration;
  }

  /**
   * 获取缓存大小
   * @returns 缓存条目数量
   */
  public getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    performanceMonitor.start('cache_clean');

    const now = Date.now();
    const keysToDelete: string[] = [];

    // 首先收集要删除的键，避免在遍历过程中修改集合
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheDuration) {
        keysToDelete.push(key);
      }
    }

    // 然后批量删除
    keysToDelete.forEach(key => this.cache.delete(key));

    performanceMonitor.end('cache_clean');
  }

  /**
   * 生成缓存键
   * @param content Markdown内容
   * @returns 缓存键
   */
  private generateKey(content: string): string {
    // 简单的哈希函数，用于生成缓存键
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `md_${hash}`;
  }
}

// 导出单例实例
export const markdownCache = new MarkdownCache();

export default markdownCache;
