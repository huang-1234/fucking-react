/**
 * JSX解析器核心模块
 * 实现JSX到React.createElement的转换
 */

/**
 * 主解析函数 - 将JSX字符串转换为JS代码
 * @param {string} jsxString JSX代码字符串
 * @returns {string} 转换后的JavaScript代码
 */
function parseJSX(jsxString) {
  const tokens = tokenize(jsxString); // 分词
  const ast = buildAST(tokens);       // 构建AST
  return generateCode(ast);           // 生成代码
}

/**
 * 词法分析 - 将JSX字符串分解为标记序列
 * @param {string} jsx JSX代码字符串
 * @returns {Array} 标记数组
 */
function tokenize(jsx) {
  // 简化版的JSX词法分析
  // 实际实现需要更复杂的正则表达式或状态机
  const tagRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g;
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  const expressionRegex = /{([^{}]*)}/g;
  const tokens = [];

  let match;
  while ((match = tagRegex.exec(jsx)) !== null) {
    const [_, tag, attrsStr, content] = match;
    const attrs = {};
    let attrMatch;

    // 解析属性
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const [_, name, value] = attrMatch;
      attrs[name] = value;
    }

    // 处理内容中的表达式
    const children = [];
    let lastIndex = 0;
    let exprMatch;

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
 * @param {Array} tokens 标记数组
 * @returns {Object} AST根节点
 */
function buildAST(tokens) {
  const root = { type: 'ROOT', children: [] };

  tokens.forEach(token => {
    if (token.type === 'ELEMENT') {
      const node = {
        type: 'JSX_ELEMENT',
        openingElement: {
          name: token.tag,
          attributes: token.attrs
        },
        children: Array.isArray(token.children)
          ? token.children
          : [{ type: 'TEXT', value: token.children }]
      };
      root.children.push(node);
    }
  });

  return root;
}

/**
 * 代码生成 - 将AST转换为JavaScript代码
 * @param {Object} node AST节点
 * @returns {string} 生成的JavaScript代码
 */
function generateCode(node) {
  if (node.type === 'TEXT') {
    return `"${node.value}"`;
  }

  if (node.type === 'EXPRESSION') {
    return node.value; // 直接使用表达式值
  }

  if (node.type === 'JSX_ELEMENT') {
    const props = Object.entries(node.openingElement.attributes)
      .map(([key, val]) => `${key}: "${val}"`)
      .join(', ');

    const children = node.children.map(generateCode).join(', ');
    return `React.createElement("${node.openingElement.name}", {${props}}, ${children})`;
  }

  if (node.type === 'ROOT') {
    return node.children.map(generateCode).join('\n');
  }

  return '';
}

/**
 * 处理动态表达式
 * 支持JSX中的{expression}语法
 * @param {Object} node 表达式节点
 * @returns {string} 处理后的表达式代码
 */
function processExpression(node) {
  if (node.type !== 'EXPRESSION') return null;
  return node.value; // 简单返回表达式内容
}

/**
 * 生成源码映射
 * 用于调试和错误追踪
 * @param {Object} ast AST对象
 * @param {string} originalJSX 原始JSX代码
 * @returns {Object} 源码映射对象
 */
function buildSourceMap(ast, originalJSX) {
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

module.exports = {
  parseJSX,
  tokenize,
  buildAST,
  generateCode,
  processExpression,
  buildSourceMap
};