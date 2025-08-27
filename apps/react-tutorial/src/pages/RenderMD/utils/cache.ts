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
    const cached = this.cache.get(this.generateKey(content));
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.html;
    }
    return null;
  }

  /**
   * 缓存Markdown HTML
   * @param content Markdown原始内容
   * @param html 渲染后的HTML
   */
  public cacheMarkdown(content: string, html: string): void {
    this.cache.set(this.generateKey(content), {
      content,
      timestamp: Date.now(),
      html
    });

    // 清理过期缓存
    this.cleanExpiredCache();
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
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheDuration) {
        this.cache.delete(key);
      }
    }
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
