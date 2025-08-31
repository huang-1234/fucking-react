import MarkdownParser from './Parser';
import Tokenizer from './Tokenizer';
import ASTBuilder from './ASTBuilder';
import { type ASTNode } from '../../common/md';

/**
 * 核心解析模块
 * 将Markdown文本解析为AST
 */
export class CoreParser {
  private parser: MarkdownParser;
  private tokenizer: Tokenizer;
  private astBuilder: ASTBuilder;

  constructor() {
    this.parser = new MarkdownParser();
    this.tokenizer = new Tokenizer();
    this.astBuilder = new ASTBuilder();
  }

  /**
   * @description 解析Markdown文本
   * @param content Markdown文本
   * @returns 解析后的AST
   */
  parse(content: string): ASTNode {
    // @description 方法1: 直接使用Parser解析
    return this.parser.parse(content);

    // 方法2: 使用Tokenizer和ASTBuilder
    // const tokens = this.tokenizer.tokenize(content);
    // return this.astBuilder.buildAST(tokens);
  }
}

export { MarkdownParser, Tokenizer, ASTBuilder };
export default CoreParser;
