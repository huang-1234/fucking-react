/**
 * Markdown工具类 - 提供常用的Markdown相关工具函数
 */
export class MarkdownUtils {
  /**
   * @description 转义Markdown特殊字符
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  static escapeMarkdown(text: string): string {
    return text
      .replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * @description 解析Markdown链接
   * @param text 包含链接的文本
   * @returns 解析后的链接数组 [text, url, title?]
   */
  static parseLink(text: string): [string, string, string?] | null {
    // 匹配 [text](url "title") 格式
    const linkRegex = /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/;
    const match = text.match(linkRegex);

    if (match) {
      return [match[1], match[2], match[3]];
    }
    return null;
  }

  /**
   * @description 解析Markdown图片
   * @param text 包含图片的文本
   * @returns 解析后的图片数组 [alt, src, title?]
   */
  static parseImage(text: string): [string, string, string?] | null {
    // 匹配 ![alt](src "title") 格式
    const imageRegex = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/;
    const match = text.match(imageRegex);

    if (match) {
      return [match[1], match[2], match[3]];
    }
    return null;
  }

  /**
   * @description 解析Markdown标题级别
   * @param text 标题文本（包含#）
   * @returns 标题级别(1-6)
   */
  static parseHeadingLevel(text: string): number {
    const match = text.match(/^(#{1,6})\s/);
    return match ? match[1].length : 0;
  }

  /**
   * @description 解析列表项缩进级别
   * @param text 列表项文本
   * @returns 缩进级别
   */
  static parseListIndentLevel(text: string): number {
    const match = text.match(/^(\s*)/);
    return match ? Math.floor(match[1].length / 2) : 0;
  }

  /**
   * @description 判断文本是否为空行
   * @param text 文本行
   * @returns 是否为空行
   */
  static isEmptyLine(text: string): boolean {
    return /^\s*$/.test(text);
  }

  /**
   * @description 判断文本是否为标题行
   * @param text 文本行
   * @returns 是否为标题行
   */
  static isHeading(text: string): boolean {
    return /^#{1,6}\s/.test(text);
  }

  /**
   * @description 判断文本是否为列表项
   * @param text 文本行
   * @returns 是否为列表项
   */
  static isListItem(text: string): boolean {
    return /^\s*[-+*]\s/.test(text) || /^\s*\d+\.\s/.test(text);
  }

  /**
   * @description 判断文本是否为代码块标记
   * @param text 文本行
   * @returns 是否为代码块标记
   */
  static isCodeFence(text: string): boolean {
    return /^```/.test(text);
  }

  /**
   * @description 判断文本是否为引用块
   * @param text 文本行
   * @returns 是否为引用块
   */
  static isBlockquote(text: string): boolean {
    return /^\s*>\s/.test(text);
  }

  /**
   * @description 判断文本是否为水平分割线
   * @param text 文本行
   * @returns 是否为水平分割线
   */
  static isHorizontalRule(text: string): boolean {
    return /^(\*{3,}|-{3,}|_{3,})$/.test(text.trim());
  }

  /**
   * @description 从URL中提取文件扩展名
   * @param url 文件URL
   * @returns 文件扩展名
   */
  static getFileExtension(url: string): string {
    const match = url.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * @description 生成唯一ID（用于标题锚点等）
   * @param text 文本内容
   * @returns 唯一ID
   */
  static generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * @description 提取纯文本内容（移除所有Markdown语法）
   * @param markdown Markdown文本
   * @returns 纯文本内容
   */
  static extractPlainText(markdown: string): string {
    return markdown
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除行内代码
      .replace(/`([^`]+)`/g, '$1')
      // 移除链接
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 移除图片
      .replace(/!\[([^\]]+)\]\([^)]+\)/g, '')
      // 移除标题标记
      .replace(/^#{1,6}\s+(.+)$/gm, '$1')
      // 移除强调和加粗
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // 移除引用标记
      .replace(/^>\s+/gm, '')
      // 移除列表标记
      .replace(/^[\s]*[-+*]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // 移除HTML标签
      .replace(/<[^>]+>/g, '')
      // 移除多余空白
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * @description 计算Markdown文本的阅读时间（粗略估计）
   * @param markdown Markdown文本
   * @param wordsPerMinute 每分钟阅读字数
   * @returns 阅读时间（分钟）
   */
  static estimateReadingTime(markdown: string, wordsPerMinute = 200): number {
    const plainText = this.extractPlainText(markdown);
    const wordCount = plainText.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * @description 提取Markdown文本中的所有链接
   * @param markdown Markdown文本
   * @returns 链接数组 [{text, url, title?}]
   */
  static extractLinks(markdown: string): Array<{text: string, url: string, title?: string}> {
    const links: Array<{text: string, url: string, title?: string}> = [];
    const linkRegex = /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g;
    let match;

    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        title: match[3]
      });
    }

    return links;
  }

  /**
   * @description 提取Markdown文本中的所有图片
   * @param markdown Markdown文本
   * @returns 图片数组 [{alt, src, title?}]
   */
  static extractImages(markdown: string): Array<{alt: string, src: string, title?: string}> {
    const images: Array<{alt: string, src: string, title?: string}> = [];
    const imageRegex = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g;
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      images.push({
        alt: match[1],
        src: match[2],
        title: match[3]
      });
    }

    return images;
  }

  /**
   * @description 提取Markdown文本中的所有标题
   * @param markdown Markdown文本
   * @returns 标题数组 [{level, text, id}]
   */
  static extractHeadings(markdown: string): Array<{level: number, text: string, id: string}> {
    const headings: Array<{level: number, text: string, id: string}> = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.generateId(text);

      headings.push({ level, text, id });
    }

    return headings;
  }
}

export default MarkdownUtils;
