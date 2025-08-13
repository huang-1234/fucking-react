/**
 * JSX编译器主入口文件
 * 导出所有公共API
 */

const jsxParser = require('./src/jsxParser');
const babelPlugin = require('./src/babelPlugin');

module.exports = {
  // JSX解析器核心API
  parseJSX: jsxParser.parseJSX,
  tokenize: jsxParser.tokenize,
  buildAST: jsxParser.buildAST,
  generateCode: jsxParser.generateCode,

  // Babel插件
  babelPlugin,

  // 辅助工具
  buildSourceMap: jsxParser.buildSourceMap,

  // 版本信息
  version: require('./package.json').version
};