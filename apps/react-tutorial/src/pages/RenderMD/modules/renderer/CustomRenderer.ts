import { type ASTNode, ASTNodeType } from '../../common/md';
import React from 'react';

/**
 * @description 自定义渲染器 - 将AST转换为React组件
 */
export class CustomRenderer {
  private options: {
    components: Record<string, React.ComponentType<any>>;
    sanitize: boolean;
    linkTarget: string;
  };

  constructor(options?: {
    components?: Record<string, React.ComponentType<any>>;
    sanitize?: boolean;
    linkTarget?: string;
  }) {
    this.options = {
      components: options?.components || {},
      sanitize: options?.sanitize ?? true,
      linkTarget: options?.linkTarget ?? '_blank'
    };
  }

  /**
   * @description 渲染AST为React元素
   * @param ast 抽象语法树
   * @returns React元素
   */
  render(ast: ASTNode): React.ReactNode {
    return this.renderNode(ast);
  }

  /**
   * @description 渲染单个节点
   * @param node AST节点
   * @returns React元素
   */
  private renderNode(node: ASTNode): React.ReactNode {
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
        return null;
    }
  }

  /**
   * @description 渲染子节点
   * @param node 父节点
   * @returns React元素数组
   */
  private renderChildren(node: ASTNode): React.ReactNode {
    if (!node.children || node.children.length === 0) {
      return node.content || '';
    }

    return React.createElement(
      React.Fragment,
      {},
      ...node.children.map((child, index) =>
        React.createElement(
          React.Fragment,
          { key: index },
          this.renderNode(child)
        )
      )
    );
  }

  /**
   * @description 渲染标题
   * @param node 标题节点
   * @returns React元素
   */
  private renderHeading(node: ASTNode): React.ReactNode {
    const level = node.level || 1;
    const content = node.content || this.renderChildren(node);
    const id = this.generateHeadingId(typeof content === 'string' ? content : '');

    // 使用自定义组件(如果有)
    const HeadingComponent = this.options.components[`h${level}`];
    if (HeadingComponent) {
      return React.createElement(
        HeadingComponent,
        { id, level },
        content
      );
    }

    // 默认渲染
    return React.createElement(
      `h${level}`,
      { id },
      content
    );
  }

  /**
   * @description 渲染段落
   * @param node 段落节点
   * @returns React元素
   */
  private renderParagraph(node: ASTNode): React.ReactNode {
    const content = node.content || this.renderChildren(node);

    // 使用自定义组件(如果有)
    const ParagraphComponent = this.options.components.p;
    if (ParagraphComponent) {
      return React.createElement(
        ParagraphComponent,
        {},
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'p',
      {},
      content
    );
  }

  /**
   * @description 渲染引用块
   * @param node 引用块节点
   * @returns React元素
   */
  private renderBlockquote(node: ASTNode): React.ReactNode {
    const content = node.content || this.renderChildren(node);

    // 使用自定义组件(如果有)
    const BlockquoteComponent = this.options.components.blockquote;
    if (BlockquoteComponent) {
      return React.createElement(
        BlockquoteComponent,
        {},
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'blockquote',
      {},
      content
    );
  }

  /**
   * @description 渲染列表
   * @param node 列表节点
   * @returns React元素
   */
  private renderList(node: ASTNode): React.ReactNode {
    // 检查是否为有序列表
    const isOrdered = node.attrs?.ordered === 'true';
    const tag = isOrdered ? 'ol' : 'ul';
    const children = node.children?.map((child, index) =>
      React.createElement(
        React.Fragment,
        { key: index },
        this.renderNode(child)
      )
    );

    // 使用自定义组件(如果有)
    const ListComponent = this.options.components[tag];
    if (ListComponent) {
      return React.createElement(
        ListComponent,
        { ordered: isOrdered },
        children
      );
    }

    // 默认渲染
    return React.createElement(
      tag,
      {},
      children
    );
  }

  /**
   * @description 渲染列表项
   * @param node 列表项节点
   * @returns React元素
   */
  private renderListItem(node: ASTNode): React.ReactNode {
    const content = node.content || this.renderChildren(node);

    // 使用自定义组件(如果有)
    const ListItemComponent = this.options.components.li;
    if (ListItemComponent) {
      return React.createElement(
        ListItemComponent,
        {},
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'li',
      {},
      content
    );
  }

  /**
   * 渲染代码块
   * @param node 代码块节点
   * @returns React元素
   */
  private renderCodeBlock(node: ASTNode): React.ReactNode {
    const content = node.content || '';
    const lang = node.attrs?.lang || '';

    // 使用自定义组件(如果有)
    const CodeBlockComponent = this.options.components.code;
    if (CodeBlockComponent) {
      return React.createElement(
        CodeBlockComponent,
        { language: lang, inline: false },
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'pre',
      {},
      React.createElement(
        'code',
        { className: lang ? `language-${lang}` : '' },
        content
      )
    );
  }

  /**
   * 渲染行内代码
   * @param node 行内代码节点
   * @returns React元素
   */
  private renderInlineCode(node: ASTNode): React.ReactNode {
    const content = node.content || '';

    // 使用自定义组件(如果有)
    const InlineCodeComponent = this.options.components.code;
    if (InlineCodeComponent) {
      return React.createElement(
        InlineCodeComponent,
        { inline: true },
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'code',
      {},
      content
    );
  }

  /**
   * 渲染强调(斜体)
   * @param node 强调节点
   * @returns React元素
   */
  private renderEmphasis(node: ASTNode): React.ReactNode {
    const content = node.content || '';

    // 使用自定义组件(如果有)
    const EmComponent = this.options.components.em;
    if (EmComponent) {
      return React.createElement(
        EmComponent,
        {},
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'em',
      {},
      content
    );
  }

  /**
   * 渲染加粗
   * @param node 加粗节点
   * @returns React元素
   */
  private renderStrong(node: ASTNode): React.ReactNode {
    const content = node.content || '';

    // 使用自定义组件(如果有)
    const StrongComponent = this.options.components.strong;
    if (StrongComponent) {
      return React.createElement(
        StrongComponent,
        {},
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'strong',
      {},
      content
    );
  }

  /**
   * 渲染链接
   * @param node 链接节点
   * @returns React元素
   */
  private renderLink(node: ASTNode): React.ReactNode {
    const content = node.content || '';
    const href = this.sanitizeUrl(node.attrs?.href || '');
    const props = {
      href,
      target: this.options.linkTarget,
      rel: this.options.linkTarget === '_blank' ? 'noopener noreferrer' : undefined
    };

    // 使用自定义组件(如果有)
    const LinkComponent = this.options.components.a;
    if (LinkComponent) {
      return React.createElement(
        LinkComponent,
        props,
        content
      );
    }

    // 默认渲染
    return React.createElement(
      'a',
      props,
      content
    );
  }

  /**
   * 渲染图片
   * @param node 图片节点
   * @returns React元素
   */
  private renderImage(node: ASTNode): React.ReactNode {
    const alt = node.attrs?.alt || '';
    const src = this.sanitizeUrl(node.attrs?.src || '');
    const title = node.attrs?.title;
    const props = { src, alt, title };

    // 使用自定义组件(如果有)
    const ImageComponent = this.options.components.img;
    if (ImageComponent) {
      return React.createElement(
        ImageComponent,
        props
      );
    }

    // 默认渲染
    return React.createElement(
      'img',
      props
    );
  }

  /**
   * 渲染文本
   * @param node 文本节点
   * @returns 文本内容
   */
  private renderText(node: ASTNode): string {
    return node.content || '';
  }

  /**
   * 渲染自定义块
   * @param node 自定义块节点
   * @returns React元素
   */
  private renderCustomBlock(node: ASTNode): React.ReactNode {
    // 处理水平分割线
    if (node.content === '---') {
      // 使用自定义组件(如果有)
      const HrComponent = this.options.components.hr;
      if (HrComponent) {
        return React.createElement(HrComponent, {});
      }

      // 默认渲染
      return React.createElement('hr', {});
    }

    // 其他自定义块
    return React.createElement(
      'div',
      { className: 'custom-block' },
      node.content
    );
  }

  /**
   * 生成标题ID
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
   * 清理URL
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

export default CustomRenderer;
