/**
 * Markdown渲染缓存工具
 * 用于缓存已渲染的Markdown内容，提高性能
 */

interface CacheOptions {
  maxSize?: number;
  ttl?: number; // 缓存有效期（毫秒）
}

class MarkdownCache {
  private cache: Map<string, { html: string, timestamp: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(options?: CacheOptions) {
    this.cache = new Map();
    this.maxSize = options?.maxSize || 100;
    this.ttl = options?.ttl || 5 * 60 * 1000; // 默认5分钟
  }

  /**
   * 获取缓存的Markdown渲染结果
   * @param key 缓存键
   * @returns 缓存的HTML或null
   */
  public getCachedMarkdown(key: string): string | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.html;
  }

  /**
   * 缓存Markdown渲染结果
   * @param key 缓存键
   * @param html 渲染后的HTML
   */
  public cacheMarkdown(key: string, html: string): void {
    // 如果缓存已满，删除最早的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      html,
      timestamp: Date.now()
    });
  }

  /**
   * 清除缓存
   * @param key 可选，指定要清除的缓存键
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存大小
   * @returns 缓存条目数量
   */
  public getSize(): number {
    return this.cache.size;
  }
}

// 导出单例实例
const markdownCache = new MarkdownCache();
export default markdownCache;