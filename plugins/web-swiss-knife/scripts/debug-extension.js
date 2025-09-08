#!/usr/bin/env node

/**
 * Web Swiss Knife 浏览器扩展调试脚本
 *
 * 该脚本用于启动 Playwright 调试模式，方便本地开发和调试
 */
import { execSync } from 'child_process';

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

/**
 * 主函数
 */
function main() {
  log('=== Web Swiss Knife 浏览器扩展调试脚本 ===', 'magenta');

  // 检查参数
  const args = process.argv.slice(2);
  const command = args[0] || 'debug';
  const testFile = args[1] || '';

  // 构建命令
  let cmd;
  switch (command) {
    case 'build':
      log('构建插件...', 'blue');
      exec('yarn build');
      break;

    case 'test':
      log('运行测试...', 'blue');
      if (testFile) {
        exec(`npx playwright test ${testFile}`);
      } else {
        exec('npx playwright test');
      }
      break;

    case 'debug':
      log('启动调试模式...', 'blue');
      if (testFile) {
        exec(`npx playwright test ${testFile} --debug`);
      } else {
        exec('npx playwright test --debug');
      }
      break;

    case 'ui':
      log('启动 Playwright UI 模式...', 'blue');
      exec('npx playwright test --ui');
      break;

    case 'report':
      log('打开测试报告...', 'blue');
      exec('npx playwright show-report');
      break;

    default:
      log(`未知命令: ${command}`, 'red');
      log('可用命令: build, test, debug, ui, report', 'yellow');
      process.exit(1);
  }

  log('完成!', 'green');
}

// 执行主函数
main();
