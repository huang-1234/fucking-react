/**
 * 词法分析器 - 负责将Markdown文本分割成标记(tokens)
 */
export enum TokenType {
  TEXT = 'text',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  CODE_BLOCK = 'code_block',
  CODE_INLINE = 'code_inline',
  BLOCKQUOTE = 'blockquote',
  LIST_ITEM = 'list_item',
  EMPHASIS = 'emphasis',
  STRONG = 'strong',
  LINK = 'link',
  IMAGE = 'image',
  NEWLINE = 'newline',
  HORIZONTAL_RULE = 'horizontal_rule'
}
/**
 * 标记接口
 */
export interface Token {
  type: TokenType;
  value: string;
  raw: string;
  depth?: number; // 用于标题级别、列表嵌套等
  lang?: string;  // 用于代码块语言
  href?: string;  // 用于链接
  alt?: string;   // 用于图片
}

/**
 * 词法分析器
 */
export class Tokenizer {
  /** @description 源文本 */
  private source: string = '';
  /** @description 标记数组 */
  private tokens: Token[] = [];
  /** @description 位置 */
  private position: number = 0;
  /** @description 长度 */
  private length: number = 0;

  /**
   * 将Markdown文本转换为标记序列
   * @param source Markdown源文本
   * @returns 标记数组
   */
  tokenize(source: string): Token[] {
    /** @description 源文本 */
    this.source = source;
    /** @description 标记数组 */
    this.tokens = [];
    /** @description 位置 */
    this.position = 0;
    /** @description 长度 */
    this.length = source.length;

    // 逐行处理
    const lines = source.split('\n');
    /** @description 行数 */
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      this.tokenizeLine(line);

      // 添加换行标记(除了最后一行)
      if (i < lines.length - 1) {
        this.tokens.push({
          type: TokenType.NEWLINE,
          value: '\n',
          raw: '\n'
        });
      }
    }

    return this.tokens;
  }

  /**
   * 处理单行文本
   * @param line 行文本
   */
  private tokenizeLine(line: string): void {
    // 跳过空行
    if (line.trim() === '') {
      return;
    }

    // 检查标题
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const content = match[2];
        this.tokens.push({
          type: TokenType.HEADING,
          value: content,
          raw: line,
          depth: level
        });
        return;
      }
    }

    // 检查代码块
    if (line.startsWith('```')) {
      const langMatch = line.match(/^```(\w*)$/);
      const lang = langMatch ? langMatch[1] : '';
      this.tokens.push({
        type: TokenType.CODE_BLOCK,
        value: '',
        raw: line,
        lang
      });
      return;
    }

    // 检查引用块
    if (line.startsWith('>')) {
      const content = line.substring(1).trim();
      this.tokens.push({
        type: TokenType.BLOCKQUOTE,
        value: content,
        raw: line
      });
      return;
    }

    // 检查无序列表
    if (line.match(/^[\-\*\+]\s/)) {
      const content = line.replace(/^[\-\*\+]\s/, '');
      this.tokens.push({
        type: TokenType.LIST_ITEM,
        value: content,
        raw: line,
        depth: 0 // 默认深度
      });
      return;
    }

    // 检查有序列表
    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      this.tokens.push({
        type: TokenType.LIST_ITEM,
        value: content,
        raw: line,
        depth: 0 // 默认深度
      });
      return;
    }

    // 检查水平分割线
    if (line.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      this.tokens.push({
        type: TokenType.HORIZONTAL_RULE,
        value: '',
        raw: line
      });
      return;
    }

    // 默认作为段落处理
    this.tokens.push({
      type: TokenType.PARAGRAPH,
      value: line,
      raw: line
    });

    // 处理行内元素
    this.tokenizeInlineElements(line);
  }

  /**
   * 处理行内元素
   * @param text 文本内容
   */
  private tokenizeInlineElements(text: string): void {
    let position = 0;
    let buffer = '';

    while (position < text.length) {
      const char = text[position];

      // 处理行内代码
      if (char === '`') {
        const endPos = text.indexOf('`', position + 1);
        if (endPos > position) {
          const codeContent = text.substring(position + 1, endPos);
          this.tokens.push({
            type: TokenType.CODE_INLINE,
            value: codeContent,
            raw: `\`${codeContent}\``
          });
          position = endPos + 1;
          continue;
        }
      }

      // 处理加粗
      if (char === '*' && text[position + 1] === '*') {
        const endPos = text.indexOf('**', position + 2);
        if (endPos > position) {
          const strongContent = text.substring(position + 2, endPos);
          this.tokens.push({
            type: TokenType.STRONG,
            value: strongContent,
            raw: `**${strongContent}**`
          });
          position = endPos + 2;
          continue;
        }
      }

      // 处理斜体
      if (char === '*' && text[position + 1] !== '*') {
        const endPos = text.indexOf('*', position + 1);
        if (endPos > position) {
          const emphContent = text.substring(position + 1, endPos);
          this.tokens.push({
            type: TokenType.EMPHASIS,
            value: emphContent,
            raw: `*${emphContent}*`
          });
          position = endPos + 1;
          continue;
        }
      }

      // 处理链接
      if (char === '[') {
        const closeBracket = text.indexOf(']', position);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket > position && openParen === closeBracket + 1 && closeParen > openParen) {
          const linkText = text.substring(position + 1, closeBracket);
          const linkHref = text.substring(openParen + 1, closeParen);

          this.tokens.push({
            type: TokenType.LINK,
            value: linkText,
            raw: `[${linkText}](${linkHref})`,
            href: linkHref
          });

          position = closeParen + 1;
          continue;
        }
      }

      // 处理图片
      if (char === '!' && text[position + 1] === '[') {
        const closeBracket = text.indexOf(']', position);
        const openParen = text.indexOf('(', closeBracket);
        const closeParen = text.indexOf(')', openParen);

        if (closeBracket > position && openParen === closeBracket + 1 && closeParen > openParen) {
          const altText = text.substring(position + 2, closeBracket);
          const imgSrc = text.substring(openParen + 1, closeParen);

          this.tokens.push({
            type: TokenType.IMAGE,
            value: '',
            raw: `![${altText}](${imgSrc})`,
            href: imgSrc,
            alt: altText
          });

          position = closeParen + 1;
          continue;
        }
      }

      buffer += char;
      position++;

      // 处理普通文本
      if (position === text.length && buffer.trim()) {
        this.tokens.push({
          type: TokenType.TEXT,
          value: buffer,
          raw: buffer
        });
        buffer = '';
      }
    }
  }
}

export default Tokenizer;
