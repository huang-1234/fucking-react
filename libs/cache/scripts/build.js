#!/usr/bin/env node

/**
 * 构建脚本
 * 用于构建主包和子包
 */
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const target = args[0] || 'all';

// 构建主包
function buildMain() {
  console.log('构建主包...');
  process.env.BUILD_TARGET = 'main';
  execSync('vite build', { stdio: 'inherit', env: { ...process.env, BUILD_TARGET: 'main' } });
}

// 构建service-work子包
function buildServiceWork() {
  console.log('构建service-work子包...');
  process.env.BUILD_TARGET = 'service-work';
  execSync('vite build', { stdio: 'inherit', env: { ...process.env, BUILD_TARGET: 'service-work' } });
}

// 根据目标执行不同的构建流程
if (target === 'all') {
  buildMain();
  buildServiceWork();
} else if (target === 'main') {
  buildMain();
} else if (target === 'service-work') {
  buildServiceWork();
} else {
  console.error(`错误: 未知的构建目标 "${target}"`);
  console.log('有效的选项: all, main, service-work');
  process.exit(1);
}
