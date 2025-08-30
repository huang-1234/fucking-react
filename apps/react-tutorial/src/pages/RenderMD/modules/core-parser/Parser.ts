import { type ASTNode, ASTNodeType, ParserState } from '../../common/md';

/**
 * Markdown解析器 - 核心解析模块
 * 负责将原始Markdown文本转换为结构化的AST
 */
export class MarkdownParser {
  private content: string;
  private position: number = 0;
  private state: ParserState = ParserState.NORMAL;
  private ast: ASTNode;

  constructor() {
    this.content = '';
    this.ast = {
      type: ASTNodeType.DOCUMENT,
      children: []
    };
  }

  /**
   * 解析Markdown文本
   * @param content Markdown文本内容
   * @returns 解析后的AST
   */
  parse(content: string): ASTNode {
    this.content = content;
    this.position = 0;
    this.ast = {
      type: ASTNodeType.DOCUMENT,
      children: []
    };

    // 逐行解析
    const lines = content.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      i = this.parseLine(lines, i);
    }

    return this.ast;
  }

  /**
   * 解析单行内容
   * @param lines 所有行
   * @param lineIndex 当前行索引
   * @returns 下一行索引
   */
  private parseLine(lines: string[], lineIndex: number): number {
    const line = lines[lineIndex];

    // 根据当前状态处理行
    switch (this.state) {
      case ParserState.NORMAL:
        return this.parseNormalLine(lines, lineIndex);
      case ParserState.IN_CODE_BLOCK:
        return this.parseCodeBlockLine(lines, lineIndex);
      case ParserState.IN_BLOCKQUOTE:
        return this.parseBlockquoteLine(lines, lineIndex);
      case ParserState.IN_LIST:
        return this.parseListLine(lines, lineIndex);
      default:
        return lineIndex + 1;
    }
  }

  /**
   * 在普通状态下解析行
   * @param lines 所有行
   * @param lineIndex 当前行索引
   * @returns 下一行索引
   */
  private parseNormalLine(lines: string[], lineIndex: number): number {
    const line = lines[lineIndex];

    // 处理空行
    if (line.trim() === '') {
      return lineIndex + 1;
    }

    // 处理标题
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const content = match[2];
        this.ast.children?.push({
          type: ASTNodeType.HEADING,
          content,
          level
        });
        return lineIndex + 1;
      }
    }

    // 处理代码块开始
    if (line.startsWith('```')) {
      const langMatch = line.match(/^```(\w*)$/);
      const lang = langMatch ? langMatch[1] : '';

      // 创建代码块节点
      const codeBlockNode: ASTNode = {
        type: ASTNodeType.CODE_BLOCK,
        content: '',
        attrs: { lang }
      };

      this.ast.children?.push(codeBlockNode);
      this.state = ParserState.IN_CODE_BLOCK;
      return lineIndex + 1;
    }

    // 处理引用块
    if (line.startsWith('>')) {
      const blockquoteNode: ASTNode = {
        type: ASTNodeType.BLOCKQUOTE,
        children: []
      };

      this.ast.children?.push(blockquoteNode);
      this.state = ParserState.IN_BLOCKQUOTE;
      return this.parseBlockquoteLine(lines, lineIndex);
    }

    // 处理列表
    if (line.match(/^[\-\*\+]\s/) || line.match(/^\d+\.\s/)) {
      const listNode: ASTNode = {
        type: ASTNodeType.LIST,
        children: []
      };

      this.ast.children?.push(listNode);
      this.state = ParserState.IN_LIST;
      return this.parseListLine(lines, lineIndex);
    }

    // 默认作为段落处理
    const paragraphNode: ASTNode = {
      type: ASTNodeType.PARAGRAPH,
      content: line,
      children: this.parseInlineElements(line)
    };

    this.ast.children?.push(paragraphNode);
    return lineIndex + 1;
  }

  /**
   * 解析代码块行
   * @param lines 所有行
   * @param lineIndex 当前行索引
   * @returns 下一行索引
   */
  private parseCodeBlockLine(lines: string[], lineIndex: number): number {
    const line = lines[lineIndex];

    // 检查代码块是否结束
    if (line.startsWith('```')) {
      this.state = ParserState.NORMAL;
      return lineIndex + 1;
    }

    // 将行添加到当前代码块内容
    const lastNode = this.ast.children?.[this.ast.children.length - 1];
    if (lastNode && lastNode.type === ASTNodeType.CODE_BLOCK) {
      lastNode.content = (lastNode.content || '') + line + '\n';
    }

    return lineIndex + 1;
  }

  /**
   * 解析引用块行
   * @param lines 所有行
   * @param lineIndex 当前行索引
   * @returns 下一行索引
   */
  private parseBlockquoteLine(lines: string[], lineIndex: number): number {
    const line = lines[lineIndex];

    // 检查是否还在引用块内
    if (!line.startsWith('>') && line.trim() !== '') {
      this.state = ParserState.NORMAL;
      return lineIndex;
    }

    // 处理引用块内容
    const content = line.startsWith('>') ? line.substring(1).trim() : '';
    const lastNode = this.ast.children?.[this.ast.children.length - 1];

    if (lastNode && lastNode.type === ASTNodeType.BLOCKQUOTE) {
      const paragraphNode: ASTNode = {
        type: ASTNodeType.PARAGRAPH,
        content,
        children: this.parseInlineElements(content)
      };

      lastNode.children?.push(paragraphNode);
    }

    return lineIndex + 1;
  }

  /**
   * 解析列表行
   * @param lines 所有行
   * @param lineIndex 当前行索引
   * @returns 下一行索引
   */
  private parseListLine(lines: string[], lineIndex: number): number {
    const line = lines[lineIndex];

    // 检查是否还在列表内
    const isListItem = line.match(/^[\-\*\+]\s/) || line.match(/^\d+\.\s/);
    if (!isListItem && line.trim() !== '') {
      this.state = ParserState.NORMAL;
      return lineIndex;
    }

    // 处理列表项
    if (isListItem) {
      const content = line.replace(/^[\-\*\+]\s/, '').replace(/^\d+\.\s/, '');
      const lastNode = this.ast.children?.[this.ast.children.length - 1];

      if (lastNode && lastNode.type === ASTNodeType.LIST) {
        const listItemNode: ASTNode = {
          type: ASTNodeType.LIST_ITEM,
          content,
          children: this.parseInlineElements(content)
        };

        lastNode.children?.push(listItemNode);
      }
    }

    return lineIndex + 1;
  }

  /**
   * 解析行内元素
   * @param text 文本内容
   * @returns 解析后的节点数组
   */
  private parseInlineElements(text: string): ASTNode[] {
    const nodes: ASTNode[] = [];
    let currentText = '';
    let i = 0;

    while (i < text.length) {
      // 处理强调 (斜体)
      if (text[i] === '*' && text[i+1] !== '*') {
        if (currentText) {
          nodes.push({ type: ASTNodeType.TEXT, content: currentText });
          currentText = '';
        }

        const endIdx = text.indexOf('*', i + 1);
        if (endIdx > i) {
          const emphContent = text.substring(i + 1, endIdx);
          nodes.push({
            type: ASTNodeType.EMPH,
            content: emphContent
          });
          i = endIdx + 1;
          continue;
        }
      }

      // 处理加粗
      if (text[i] === '*' && text[i+1] === '*') {
        if (currentText) {
          nodes.push({ type: ASTNodeType.TEXT, content: currentText });
          currentText = '';
        }

        const endIdx = text.indexOf('**', i + 2);
        if (endIdx > i) {
          const strongContent = text.substring(i + 2, endIdx);
          nodes.push({
            type: ASTNodeType.STRONG,
            content: strongContent
          });
          i = endIdx + 2;
          continue;
        }
      }

      // 处理行内代码
      if (text[i] === '`') {
        if (currentText) {
          nodes.push({ type: ASTNodeType.TEXT, content: currentText });
          currentText = '';
        }

        const endIdx = text.indexOf('`', i + 1);
        if (endIdx > i) {
          const codeContent = text.substring(i + 1, endIdx);
          nodes.push({
            type: ASTNodeType.INLINE_CODE,
            content: codeContent
          });
          i = endIdx + 1;
          continue;
        }
      }

      // 处理链接
      if (text[i] === '[') {
        const closeBracket = text.indexOf(']', i);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket > i && openParen === closeBracket + 1 && closeParen > openParen) {
          if (currentText) {
            nodes.push({ type: ASTNodeType.TEXT, content: currentText });
            currentText = '';
          }

          const linkText = text.substring(i + 1, closeBracket);
          const linkHref = text.substring(openParen + 1, closeParen);

          nodes.push({
            type: ASTNodeType.LINK,
            content: linkText,
            attrs: { href: linkHref }
          });

          i = closeParen + 1;
          continue;
        }
      }

      // 处理图片
      if (text[i] === '!' && text[i+1] === '[') {
        const closeBracket = text.indexOf(']', i);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket > i && openParen === closeBracket + 1 && closeParen > openParen) {
          if (currentText) {
            nodes.push({ type: ASTNodeType.TEXT, content: currentText });
            currentText = '';
          }

          const altText = text.substring(i + 2, closeBracket);
          const imgSrc = text.substring(openParen + 1, closeParen);

          nodes.push({
            type: ASTNodeType.IMAGE,
            content: altText,
            attrs: { src: imgSrc, alt: altText }
          });

          i = closeParen + 1;
          continue;
        }
      }

      currentText += text[i];
      i++;
    }

    if (currentText) {
      nodes.push({ type: ASTNodeType.TEXT, content: currentText });
    }

    return nodes;
  }
}

export default MarkdownParser;
