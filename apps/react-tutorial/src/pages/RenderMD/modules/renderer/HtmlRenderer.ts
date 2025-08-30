import { type ASTNode, ASTNodeType } from '../../common/md';

/**
 * @description HTML渲染器 - 将AST转换为HTML
 */
export class HtmlRenderer {
  private options: {
    sanitize: boolean;
    linkTarget: string;
  };

  constructor(options?: { sanitize?: boolean; linkTarget?: string }) {
    this.options = {
      sanitize: options?.sanitize ?? true,
      linkTarget: options?.linkTarget ?? '_blank'
    };
  }

  /**
   * @description 渲染AST为HTML
   * @param ast 抽象语法树
   * @returns HTML字符串
   */
  render(ast: ASTNode): string {
    return this.renderNode(ast);
  }

  /**
   * @description 渲染单个节点
   * @param node AST节点
   * @returns 渲染后的HTML
   */
  private renderNode(node: ASTNode): string {
    switch (node.type) {
      case ASTNodeType.DOCUMENT:
        return this.renderChildren(node);

      case ASTNodeType.HEADING:
        return this.renderHeading(node);

      case ASTNodeType.PARAGRAPH:
        return this.renderParagraph(node);

      case ASTNodeType.BLOCKQUOTE:
        return this.renderBlockquote(node);

      case ASTNodeType.LIST:
        return this.renderList(node);

      case ASTNodeType.LIST_ITEM:
        return this.renderListItem(node);

      case ASTNodeType.CODE_BLOCK:
        return this.renderCodeBlock(node);

      case ASTNodeType.INLINE_CODE:
        return this.renderInlineCode(node);

      case ASTNodeType.EMPH:
        return this.renderEmphasis(node);

      case ASTNodeType.STRONG:
        return this.renderStrong(node);

      case ASTNodeType.LINK:
        return this.renderLink(node);

      case ASTNodeType.IMAGE:
        return this.renderImage(node);

      case ASTNodeType.TEXT:
        return this.renderText(node);

      case ASTNodeType.CUSTOM_BLOCK:
        return this.renderCustomBlock(node);

      default:
        return '';
    }
  }

  /**
   * @description 渲染子节点
   * @param node 父节点
   * @returns 渲染后的HTML
   */
  private renderChildren(node: ASTNode): string {
    if (!node.children || node.children.length === 0) {
      return node.content || '';
    }

    return node.children.map(child => this.renderNode(child)).join('');
  }

  /**
   * @description 渲染标题
   * @param node 标题节点
   * @returns 渲染后的HTML
   */
  private renderHeading(node: ASTNode): string {
    const level = node.level || 1;
    const content = node.content || this.renderChildren(node);
    const id = this.generateHeadingId(content);

    return `<h${level} id="${id}">${this.escapeHtml(content)}</h${level}>`;
  }

  /**
   * @description 渲染段落
   * @param node 段落节点
   * @returns 渲染后的HTML
   */
  private renderParagraph(node: ASTNode): string {
    const content = node.content || this.renderChildren(node);
    return `<p>${this.escapeHtml(content)}</p>`;
  }

  /**
   * @description 渲染引用块
   * @param node 引用块节点
   * @returns 渲染后的HTML
   */
  private renderBlockquote(node: ASTNode): string {
    const content = node.content || this.renderChildren(node);
    return `<blockquote>${this.escapeHtml(content)}</blockquote>`;
  }

  /**
   * @description 渲染列表
   * @param node 列表节点
   * @returns 渲染后的HTML
   */
  private renderList(node: ASTNode): string {
    // 检查是否为有序列表
    const isOrdered = node.attrs?.ordered === 'true';
    const tag = isOrdered ? 'ol' : 'ul';

    return `<${tag}>${this.renderChildren(node)}</${tag}>`;
  }

  /**
   * @description 渲染列表项
   * @param node 列表项节点
   * @returns 渲染后的HTML
   */
  private renderListItem(node: ASTNode): string {
    const content = node.content || this.renderChildren(node);
    return `<li>${this.escapeHtml(content)}</li>`;
  }

  /**
   * @description 渲染代码块
   * @param node 代码块节点
   * @returns 渲染后的HTML
   */
  private renderCodeBlock(node: ASTNode): string {
    const content = node.content || '';
    const lang = node.attrs?.lang || '';
    const langClass = lang ? ` class="language-${lang}"` : '';

    return `<pre><code${langClass}>${this.escapeHtml(content)}</code></pre>`;
  }

  /**
   * @description 渲染行内代码
   * @param node 行内代码节点
   * @returns 渲染后的HTML
   */
  private renderInlineCode(node: ASTNode): string {
    const content = node.content || '';
    return `<code>${this.escapeHtml(content)}</code>`;
  }

  /**
   * @description 渲染强调(斜体)
   * @param node 强调节点
   * @returns 渲染后的HTML
   */
  private renderEmphasis(node: ASTNode): string {
    const content = node.content || '';
    return `<em>${this.escapeHtml(content)}</em>`;
  }

  /**
   * @description 渲染加粗
   * @param node 加粗节点
   * @returns 渲染后的HTML
   */
  private renderStrong(node: ASTNode): string {
    const content = node.content || '';
    return `<strong>${this.escapeHtml(content)}</strong>`;
  }

  /**
   * @description 渲染链接
   * @param node 链接节点
   * @returns 渲染后的HTML
   */
  private renderLink(node: ASTNode): string {
    const content = node.content || '';
    const href = this.sanitizeUrl(node.attrs?.href || '');
    const target = this.options.linkTarget ? ` target="${this.options.linkTarget}"` : '';
    const rel = this.options.linkTarget === '_blank' ? ' rel="noopener noreferrer"' : '';

    return `<a href="${href}"${target}${rel}>${this.escapeHtml(content)}</a>`;
  }

  /**
   * @description 渲染图片
   * @param node 图片节点
   * @returns 渲染后的HTML
   */
  private renderImage(node: ASTNode): string {
    const alt = node.attrs?.alt || '';
    const src = this.sanitizeUrl(node.attrs?.src || '');
    const title = node.attrs?.title ? ` title="${this.escapeHtml(node.attrs.title)}"` : '';

    return `<img src="${src}" alt="${this.escapeHtml(alt)}"${title}>`;
  }

  /**
   * @description 渲染文本
   * @param node 文本节点
   * @returns 渲染后的HTML
   */
  private renderText(node: ASTNode): string {
    return this.escapeHtml(node.content || '');
  }

  /**
   * @description 渲染自定义块
   * @param node 自定义块节点
   * @returns 渲染后的HTML
   */
  private renderCustomBlock(node: ASTNode): string {
    // 处理水平分割线
    if (node.content === '---') {
      return '<hr>';
    }

    // 其他自定义块
    return `<div class="custom-block">${this.escapeHtml(node.content || '')}</div>`;
  }

  /**
   * @description 生成标题ID
   * @param text 标题文本
   * @returns 生成的ID
   */
  private generateHeadingId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * @description 转义HTML特殊字符
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeHtml(text: string): string {
    if (!this.options.sanitize) {
      return text;
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * @description 清理URL
   * @param url 需要清理的URL
   * @returns 清理后的URL
   */
  private sanitizeUrl(url: string): string {
    if (!this.options.sanitize) {
      return url;
    }

    // 检查URL协议
    const protocol = url.trim().toLowerCase();
    if (
      protocol.startsWith('javascript:') ||
      protocol.startsWith('data:') ||
      protocol.startsWith('vbscript:')
    ) {
      return '';
    }

    return url;
  }
}

export default HtmlRenderer;
