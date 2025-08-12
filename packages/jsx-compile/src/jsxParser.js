/**
 * JSX解析器核心模块
 * 实现JSX到React.createElement的转换
 */

const babel = require('@babel/core');
const babelPlugin = require('./babelPlugin');

/**
 * 主解析函数 - 将JSX字符串转换为JS代码
 * @param {string} jsxString JSX代码字符串
 * @returns {string} 转换后的JavaScript代码
 */
function parseJSX(jsxString) {
  const result = babel.transformSync(jsxString, {
    plugins: [
      '@babel/plugin-syntax-jsx', // 添加JSX语法支持
      babelPlugin()
    ],
    presets: [],
    configFile: false,
    babelrc: false,
    sourceType: 'module',
    filename: 'virtual.jsx'
  });

  return result.code;
}

/**
 * 解析JSX文件
 * @param {string} filePath JSX文件路径
 * @returns {string} 转换后的JavaScript代码
 */
function parseJSXFile(filePath) {
  const result = babel.transformFileSync(filePath, {
    plugins: [
      '@babel/plugin-syntax-jsx', // 添加JSX语法支持
      babelPlugin()
    ],
    presets: [],
    configFile: false,
    babelrc: false,
    sourceType: 'module'
  });

  return result.code;
}

/**
 * 生成源码映射
 * @param {string} jsxString JSX代码字符串
 * @returns {Object} 包含代码和源码映射的对象
 */
function parseJSXWithSourceMap(jsxString) {
  const result = babel.transformSync(jsxString, {
    plugins: [
      '@babel/plugin-syntax-jsx', // 添加JSX语法支持
      babelPlugin()
    ],
    presets: [],
    configFile: false,
    babelrc: false,
    sourceType: 'module',
    filename: 'virtual.jsx',
    sourceMaps: true
  });

  return {
    code: result.code,
    map: result.map
  };
}

module.exports = {
  parseJSX,
  parseJSXFile,
  parseJSXWithSourceMap
};


(function test() {
  const jsx = `
    <div>
      <h1>Hello, World!</h1>
    </div>
  `;
  const js = parseJSX(jsx);
  console.log(js);
})()