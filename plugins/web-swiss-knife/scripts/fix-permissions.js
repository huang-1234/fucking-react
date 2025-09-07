#!/usr/bin/env node

/**
 * 修复权限问题脚本
 *
 * 该脚本用于修复 Windows 环境下的权限问题，特别是 rollup-plugin-copy 相关的问题
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    return '';
  }
}

/**
 * 检查目录是否存在
 * @param {string} dir 目录路径
 * @returns {boolean} 是否存在
 */
function directoryExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  log('=== 权限修复脚本 ===', 'magenta');

  // 检查 rollup-plugin-copy 目录
  const rollupPluginCopyDir = path.join(process.cwd(), 'node_modules', 'rollup-plugin-copy');

  if (directoryExists(rollupPluginCopyDir)) {
    log(`发现 rollup-plugin-copy 目录: ${rollupPluginCopyDir}`, 'yellow');

    // 尝试修复权限
    log('尝试修复权限...', 'blue');

    try {
      // 修改目录权限
      fs.chmodSync(rollupPluginCopyDir, 0o777);
      log('已修改目录权限为 777', 'green');

      // 列出目录内容
      const files = fs.readdirSync(rollupPluginCopyDir);
      log(`目录内容 (${files.length} 个文件): ${files.join(', ')}`, 'cyan');

      // 修改所有文件的权限
      files.forEach(file => {
        const filePath = path.join(rollupPluginCopyDir, file);
        try {
          fs.chmodSync(filePath, 0o666);
          log(`已修改文件权限: ${file}`, 'green');
        } catch (error) {
          log(`修改文件权限失败: ${file} - ${error.message}`, 'red');
        }
      });

      log('权限修复完成', 'green');
    } catch (error) {
      log(`修复权限失败: ${error.message}`, 'red');
    }
  } else {
    log('未找到 rollup-plugin-copy 目录，可能需要先安装依赖', 'yellow');

    // 尝试安装依赖
    log('尝试安装依赖...', 'blue');
    exec('npm install rollup-plugin-copy --no-save');

    // 再次检查目录
    if (directoryExists(rollupPluginCopyDir)) {
      log('成功安装 rollup-plugin-copy', 'green');
    } else {
      log('安装 rollup-plugin-copy 失败', 'red');
    }
  }

  log('完成!', 'green');
}

// 执行主函数
main();
