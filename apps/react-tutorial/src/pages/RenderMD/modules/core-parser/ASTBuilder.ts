import { type ASTNode, ASTNodeType } from '../../common/md';
import { type Token, TokenType } from './Tokenizer';

/**
 * @description AST构建器 - 负责将标记序列转换为抽象语法树
 */
export class ASTBuilder {
  private tokens: Token[] = [];
  private position: number = 0;
  private ast: ASTNode;

  constructor() {
    this.ast = {
      type: ASTNodeType.DOCUMENT,
      children: []
    };
  }

  /**
   * @description 构建AST
   * @param tokens 标记序列
   * @returns 构建的AST
   */
  buildAST(tokens: Token[]): ASTNode {
    this.tokens = tokens;
    this.position = 0;
    this.ast = {
      type: ASTNodeType.DOCUMENT,
      children: []
    };

    // 处理所有标记
    while (this.position < this.tokens.length) {
      const node = this.processToken();
      if (node) {
        this.ast.children?.push(node);
      }
    }

    return this.ast;
  }

  /**
   * @description 处理当前标记
   * @returns 生成的AST节点
   */
  private processToken(): ASTNode | null {
    const token = this.tokens[this.position];
    if (!token) return null;

    this.position++;

    switch (token.type) {
      case TokenType.HEADING:
        return {
          type: ASTNodeType.HEADING,
          content: token.value,
          level: token.depth || 1
        };

      case TokenType.PARAGRAPH:
        return {
          type: ASTNodeType.PARAGRAPH,
          content: token.value,
          children: this.processInlineElements(token.value)
        };

      case TokenType.CODE_BLOCK:
        return this.processCodeBlock();

      case TokenType.BLOCKQUOTE:
        return {
          type: ASTNodeType.BLOCKQUOTE,
          content: token.value,
          children: this.processInlineElements(token.value)
        };

      case TokenType.LIST_ITEM:
        return this.processListItem(token);

      case TokenType.HORIZONTAL_RULE:
        return {
          type: ASTNodeType.CUSTOM_BLOCK,
          content: '---'
        };

      case TokenType.NEWLINE:
        return null; // 忽略独立的换行符

      default:
        return null;
    }
  }

  /**
   * @description 处理代码块
   * @returns 代码块AST节点
   */
  private processCodeBlock(): ASTNode {
    const startToken = this.tokens[this.position - 1];
    let content = '';

    // 收集代码块内容直到结束标记
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];

      // 检查是否为代码块结束标记
      if (token.type === TokenType.CODE_BLOCK) {
        this.position++;
        break;
      }

      // 添加内容
      if (token.type === TokenType.TEXT || token.type === TokenType.PARAGRAPH) {
        content += token.value;
      }

      if (token.type === TokenType.NEWLINE) {
        content += '\n';
      }

      this.position++;
    }

    return {
      type: ASTNodeType.CODE_BLOCK,
      content,
      attrs: { lang: startToken.lang || '' }
    };
  }

  /**
   * @description 处理列表项
   * @param token 列表项标记
   * @returns 列表项AST节点
   */
  private processListItem(token: Token): ASTNode {
    // 检查是否需要创建新的列表
    let listNode: ASTNode | null = null;

    // 查找最近的列表节点
    if (this.ast.children && this.ast.children.length > 0) {
      const lastNode = this.ast.children[this.ast.children.length - 1];
      if (lastNode.type === ASTNodeType.LIST) {
        listNode = lastNode;
      }
    }

    // 如果没有找到列表节点，创建一个新的
    if (!listNode) {
      listNode = {
        type: ASTNodeType.LIST,
        children: []
      };
      this.ast.children?.push(listNode);
    }

    // 创建列表项节点
    const listItemNode: ASTNode = {
      type: ASTNodeType.LIST_ITEM,
      content: token.value,
      children: this.processInlineElements(token.value)
    };

    // 添加到列表节点
    listNode.children?.push(listItemNode);

    return listItemNode;
  }

  /**
   * @description 处理行内元素
   * @param text 文本内容
   * @returns 行内元素AST节点数组
   */
  private processInlineElements(text: string): ASTNode[] {
    const nodes: ASTNode[] = [];
    let currentPosition = 0;
    let currentText = '';

    while (currentPosition < text.length) {
      // 处理加粗
      if (text.substring(currentPosition, currentPosition + 2) === '**') {
        if (currentText) {
          nodes.push({
            type: ASTNodeType.TEXT,
            content: currentText
          });
          currentText = '';
        }

        const endPos = text.indexOf('**', currentPosition + 2);
        if (endPos !== -1) {
          const strongContent = text.substring(currentPosition + 2, endPos);
          nodes.push({
            type: ASTNodeType.STRONG,
            content: strongContent
          });
          currentPosition = endPos + 2;
          continue;
        }
      }

      // 处理斜体
      if (text[currentPosition] === '*' && text[currentPosition + 1] !== '*') {
        if (currentText) {
          nodes.push({
            type: ASTNodeType.TEXT,
            content: currentText
          });
          currentText = '';
        }

        const endPos = text.indexOf('*', currentPosition + 1);
        if (endPos !== -1) {
          const emphContent = text.substring(currentPosition + 1, endPos);
          nodes.push({
            type: ASTNodeType.EMPH,
            content: emphContent
          });
          currentPosition = endPos + 1;
          continue;
        }
      }

      // 处理行内代码
      if (text[currentPosition] === '`') {
        if (currentText) {
          nodes.push({
            type: ASTNodeType.TEXT,
            content: currentText
          });
          currentText = '';
        }

        const endPos = text.indexOf('`', currentPosition + 1);
        if (endPos !== -1) {
          const codeContent = text.substring(currentPosition + 1, endPos);
          nodes.push({
            type: ASTNodeType.INLINE_CODE,
            content: codeContent
          });
          currentPosition = endPos + 1;
          continue;
        }
      }

      // 处理链接
      if (text[currentPosition] === '[') {
        const closeBracket = text.indexOf(']', currentPosition);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
          if (currentText) {
            nodes.push({
              type: ASTNodeType.TEXT,
              content: currentText
            });
            currentText = '';
          }

          const linkText = text.substring(currentPosition + 1, closeBracket);
          const linkHref = text.substring(openParen + 1, closeParen);

          nodes.push({
            type: ASTNodeType.LINK,
            content: linkText,
            attrs: { href: linkHref }
          });

          currentPosition = closeParen + 1;
          continue;
        }
      }

      // 处理图片
      if (text[currentPosition] === '!' && text[currentPosition + 1] === '[') {
        const closeBracket = text.indexOf(']', currentPosition);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
          if (currentText) {
            nodes.push({
              type: ASTNodeType.TEXT,
              content: currentText
            });
            currentText = '';
          }

          const altText = text.substring(currentPosition + 2, closeBracket);
          const imgSrc = text.substring(openParen + 1, closeParen);

          nodes.push({
            type: ASTNodeType.IMAGE,
            content: '',
            attrs: { src: imgSrc, alt: altText }
          });

          currentPosition = closeParen + 1;
          continue;
        }
      }

      // 普通文本
      currentText += text[currentPosition];
      currentPosition++;
    }

    // 添加剩余文本
    if (currentText) {
      nodes.push({
        type: ASTNodeType.TEXT,
        content: currentText
      });
    }

    return nodes;
  }
}

export default ASTBuilder;
