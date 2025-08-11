/**
 * JSX解析器核心模块
 * 实现JSX到React.createElement的转换
 */

/**
 * Token类型
 */
export type TokenType = 'ELEMENT' | 'TEXT' | 'EXPRESSION';

/**
 * Token接口
 */
export interface Token {
  type: TokenType;
  [key: string]: any;
}

/**
 * 元素Token接口
 */
export interface ElementToken extends Token {
  type: 'ELEMENT';
  tag: string;
  attrs: Record<string, string>;
  children: (TextToken | ExpressionToken)[] | string;
}

/**
 * 文本Token接口
 */
export interface TextToken extends Token {
  type: 'TEXT';
  value: string;
}

/**
 * 表达式Token接口
 */
export interface ExpressionToken extends Token {
  type: 'EXPRESSION';
  value: string;
}

/**
 * AST节点类型
 */
export type NodeType = 'ROOT' | 'JSX_ELEMENT' | 'TEXT' | 'EXPRESSION';

/**
 * AST节点接口
 */
export interface ASTNode {
  type: NodeType;
  [key: string]: any;
}

/**
 * 根节点接口
 */
export interface RootNode extends ASTNode {
  type: 'ROOT';
  children: JSXElementNode[];
}

/**
 * JSX元素节点接口
 */
export interface JSXElementNode extends ASTNode {
  type: 'JSX_ELEMENT';
  openingElement: {
    name: string;
    attributes: Record<string, string>;
  };
  children: (TextNode | ExpressionNode)[];
}

/**
 * 文本节点接口
 */
export interface TextNode extends ASTNode {
  type: 'TEXT';
  value: string;
}

/**
 * 表达式节点接口
 */
export interface ExpressionNode extends ASTNode {
  type: 'EXPRESSION';
  value: string;
}

/**
 * 源码映射接口
 */
export interface SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  file: string;
  sourceRoot: string;
  sourcesContent: string[];
}

/**
 * 主解析函数 - 将JSX字符串转换为JS代码
 * @param jsxString JSX代码字符串
 * @returns 转换后的JavaScript代码
 */
export function parseJSX(jsxString: string): string {
  const tokens = tokenize(jsxString); // 分词
  const ast = buildAST(tokens);       // 构建AST
  return generateCode(ast);           // 生成代码
}

/**
 * 词法分析 - 将JSX字符串分解为标记序列
 * @param jsx JSX代码字符串
 * @returns 标记数组
 */
export function tokenize(jsx: string): ElementToken[] {
  // 简化版的JSX词法分析
  // 实际实现需要更复杂的正则表达式或状态机
  const tagRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g;
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  const expressionRegex = /{([^{}]*)}/g;
  const tokens: ElementToken[] = [];

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(jsx)) !== null) {
    const [_, tag, attrsStr, content] = match;
    const attrs: Record<string, string> = {};
    let attrMatch: RegExpExecArray | null;

    // 解析属性
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const [_, name, value] = attrMatch;
      attrs[name] = value;
    }

    // 处理内容中的表达式
    const children: (TextToken | ExpressionToken)[] = [];
    let lastIndex = 0;
    let exprMatch: RegExpExecArray | null;

    while ((exprMatch = expressionRegex.exec(content)) !== null) {
      const [fullMatch, expr] = exprMatch;
      const index = content.indexOf(fullMatch, lastIndex);

      // 添加表达式前的文本
      if (index > lastIndex) {
        const text = content.slice(lastIndex, index).trim();
        if (text) children.push({ type: 'TEXT', value: text });
      }

      // 添加表达式
      children.push({ type: 'EXPRESSION', value: expr });

      lastIndex = index + fullMatch.length;
    }

    // 添加剩余文本
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex).trim();
      if (text) children.push({ type: 'TEXT', value: text });
    }

    tokens.push({
      type: 'ELEMENT',
      tag,
      attrs,
      children: children.length ? children : content.trim() ? [{ type: 'TEXT', value: content.trim() }] : []
    });
  }

  return tokens;
}

/**
 * 构建抽象语法树
 * @param tokens 标记数组
 * @returns AST根节点
 */
export function buildAST(tokens: ElementToken[]): RootNode {
  const root: RootNode = { type: 'ROOT', children: [] };

  tokens.forEach(token => {
    if (token.type === 'ELEMENT') {
      const node: JSXElementNode = {
        type: 'JSX_ELEMENT',
        openingElement: {
          name: token.tag,
          attributes: token.attrs
        },
        children: Array.isArray(token.children)
          ? token.children as (TextToken | ExpressionToken)[]
          : [{ type: 'TEXT', value: token.children as string }]
      };
      root.children.push(node);
    }
  });

  return root;
}

/**
 * 代码生成 - 将AST转换为JavaScript代码
 * @param node AST节点
 * @returns 生成的JavaScript代码
 */
export function generateCode(node: ASTNode): string {
  if (node.type === 'TEXT') {
    return `"${(node as TextNode).value}"`;
  }

  if (node.type === 'EXPRESSION') {
    return (node as ExpressionNode).value; // 直接使用表达式值
  }

  if (node.type === 'JSX_ELEMENT') {
    const jsxNode = node as JSXElementNode;
    const props = Object.entries(jsxNode.openingElement.attributes)
      .map(([key, val]) => `${key}: "${val}"`)
      .join(', ');

    const children = jsxNode.children.map(child => generateCode(child)).join(', ');
    return `React.createElement("${jsxNode.openingElement.name}", {${props}}, ${children})`;
  }

  if (node.type === 'ROOT') {
    return (node as RootNode).children.map(child => generateCode(child)).join('\n');
  }

  return '';
}

/**
 * 处理动态表达式
 * 支持JSX中的{expression}语法
 * @param node 表达式节点
 * @returns 处理后的表达式代码
 */
export function processExpression(node: ASTNode): string | null {
  if (node.type !== 'EXPRESSION') return null;
  return (node as ExpressionNode).value; // 简单返回表达式内容
}

/**
 * 生成源码映射
 * 用于调试和错误追踪
 * @param ast AST对象
 * @param originalJSX 原始JSX代码
 * @returns 源码映射对象
 */
export function buildSourceMap(ast: ASTNode, originalJSX: string): SourceMap {
  // 简化实现，实际需要更复杂的映射逻辑
  return {
    version: 3,
    sources: ['original.jsx'],
    names: [],
    mappings: 'AAAA', // 简化的映射字符串
    file: 'generated.js',
    sourceRoot: '',
    sourcesContent: [originalJSX]
  };
}