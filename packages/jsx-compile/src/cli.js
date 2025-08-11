#!/usr/bin/env node

/**
 * JSX编译器命令行工具
 * 用于将JSX文件转换为JS文件
 */

const fs = require('fs');
const path = require('path');
const { parseJSX } = require('./jsxParser');

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('用法: jsx-compile <input-file> [output-file]');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.jsx$/, '.js');

// 读取输入文件
try {
  const jsxContent = fs.readFileSync(inputFile, 'utf8');

  // 解析JSX
  const jsCode = parseJSX(jsxContent);

  // 写入输出文件
  fs.writeFileSync(outputFile, jsCode, 'utf8');

  console.log(`成功将 ${inputFile} 编译为 ${outputFile}`);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}