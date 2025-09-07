#!/usr/bin/env node

/**
 * VSCode扩展构建脚本
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * 打印彩色日志
 * @param {string} message 消息内容
 * @param {string} color 颜色
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 执行命令
 * @param {string} command 命令
 * @param {boolean} silent 是否静默执行
 * @returns {string} 命令输出
 */
function exec(command, silent = false) {
  try {
    if (!silent) {
      log(`执行命令: ${command}`, 'cyan');
    }
    return execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    log(`命令执行失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const EXTENSION_DIR = path.join(DIST_DIR, 'extension');

/**
 * 确保目录存在
 * @param {string} dir 目录路径
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 复制文件
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 */
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    log(`复制文件: ${src} -> ${dest}`, 'green');
  } catch (error) {
    log(`复制文件失败: ${error.message}`, 'red');
  }
}

/**
 * 复制目录
 * @param {string} src 源目录路径
 * @param {string} dest 目标目录路径
 */
function copyDir(src, dest) {
  try {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    log(`复制目录失败: ${error.message}`, 'red');
  }
}

/**
 * 构建扩展
 */
function buildExtension() {
  log('=== VSCode扩展构建脚本 ===', 'magenta');

  // 确保扩展目录存在
  ensureDir(EXTENSION_DIR);

  // 复制必要文件
  log('复制扩展文件...', 'blue');

  // 复制package.json
  copyFile(
    path.join(ROOT_DIR, 'package.json'),
    path.join(EXTENSION_DIR, 'package.json')
  );

  // 复制README.md
  copyFile(
    path.join(ROOT_DIR, 'README.md'),
    path.join(EXTENSION_DIR, 'README.md')
  );

  // 复制扩展JS文件
  copyFile(
    path.join(DIST_DIR, 'extension.js'),
    path.join(EXTENSION_DIR, 'extension.js')
  );

  // 复制扩展JS映射文件
  if (fs.existsSync(path.join(DIST_DIR, 'extension.js.map'))) {
    copyFile(
      path.join(DIST_DIR, 'extension.js.map'),
      path.join(EXTENSION_DIR, 'extension.js.map')
    );
  }

  // 复制媒体文件
  if (fs.existsSync(path.join(ROOT_DIR, 'src', 'media'))) {
    copyDir(
      path.join(ROOT_DIR, 'src', 'media'),
      path.join(EXTENSION_DIR, 'media')
    );
  }

  // 复制Webview文件
  if (fs.existsSync(path.join(DIST_DIR, 'webview'))) {
    copyDir(
      path.join(DIST_DIR, 'webview'),
      path.join(EXTENSION_DIR, 'webview')
    );
  }

  // 打包扩展
  log('打包扩展...', 'blue');
  const vsixFile = path.join(DIST_DIR, 'universal-dev-platform.vsix');

  try {
    // 切换到扩展目录
    process.chdir(EXTENSION_DIR);

    // 使用vsce打包
    exec('npx vsce package -o ../universal-dev-platform.vsix');

    log(`扩展已打包: ${vsixFile}`, 'green');
  } catch (error) {
    log(`打包扩展失败: ${error.message}`, 'red');
  } finally {
    // 切回项目根目录
    process.chdir(ROOT_DIR);
  }

  log('构建完成!', 'green');
}

// 执行构建
buildExtension();