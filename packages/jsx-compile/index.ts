/**
 * JSX编译器主入口文件
 * 导出所有公共API
 */

import {
  parseJSX,
  tokenize,
  buildAST,
  generateCode,
  processExpression,
  buildSourceMap
} from './src/jsxParser';
import transformJSX from './src/babelPlugin';
import { version } from './package.json';

export {
  // JSX解析器核心API
  parseJSX,
  tokenize,
  buildAST,
  generateCode,

  // Babel插件
  transformJSX,

  // 辅助工具
  processExpression,
  buildSourceMap,

  // 版本信息
  version
};