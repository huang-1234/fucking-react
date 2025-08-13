#!/usr/bin/env node

/**
 * JSX编译器命令行工具
 * 用于将JSX文件转换为JS文件
 */

const fs = require('fs');
const path = require('path');
const { parseJSXFile } = require('./jsxParser');

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('用法: jsx-compile <input-file> [output-file]');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.jsx$/, '.js');

// 检查输入文件是否存在
if (!fs.existsSync(inputFile)) {
  console.error(`错误: 文件 ${inputFile} 不存在`);
  process.exit(1);
}

// 确保输出目录存在
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // 解析JSX文件
  const jsCode = parseJSXFile(inputFile);

  // 写入输出文件
  fs.writeFileSync(outputFile, jsCode, 'utf8');

  console.log(`成功将 ${inputFile} 编译为 ${outputFile}`);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}