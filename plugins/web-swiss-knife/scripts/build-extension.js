#!/usr/bin/env node

/**
 * Web Swiss Knife 浏览器扩展构建脚本
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  log('=== Web Swiss Knife 浏览器扩展构建脚本 ===', 'magenta');

  // 检查扩展目录是否已经存在
  if (fs.existsSync(EXTENSION_DIR)) {
    log('扩展目录已存在，跳过复制步骤...', 'yellow');

    // 检查必要文件是否存在
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js'
    ];

    const missingFiles = requiredFiles.filter(file =>
      !fs.existsSync(path.join(EXTENSION_DIR, file))
    );

    if (missingFiles.length > 0) {
      log(`警告: 扩展目录缺少必要文件: ${missingFiles.join(', ')}`, 'yellow');
      log('将尝试复制这些文件...', 'blue');

      // 尝试复制缺失的文件
      for (const file of missingFiles) {
        if (file === 'manifest.json' && fs.existsSync(path.join(DIST_DIR, 'manifest.json'))) {
          copyFile(
            path.join(DIST_DIR, 'manifest.json'),
            path.join(EXTENSION_DIR, 'manifest.json')
          );
        } else if (file === 'background.js') {
          if (fs.existsSync(path.join(DIST_DIR, 'background.js'))) {
            copyFile(
              path.join(DIST_DIR, 'background.js'),
              path.join(EXTENSION_DIR, 'background.js')
            );
          } else if (fs.existsSync(path.join(DIST_DIR, 'assets', 'background.js'))) {
            copyFile(
              path.join(DIST_DIR, 'assets', 'background.js'),
              path.join(EXTENSION_DIR, 'background.js')
            );
          }
        } else if (file === 'content.js') {
          if (fs.existsSync(path.join(DIST_DIR, 'content.js'))) {
            copyFile(
              path.join(DIST_DIR, 'content.js'),
              path.join(EXTENSION_DIR, 'content.js')
            );
          } else if (fs.existsSync(path.join(DIST_DIR, 'assets', 'content.js'))) {
            copyFile(
              path.join(DIST_DIR, 'assets', 'content.js'),
              path.join(EXTENSION_DIR, 'content.js')
            );
          }
        }
      }
    }
  } else {
    // 确保扩展目录存在
    ensureDir(EXTENSION_DIR);

    // 复制必要文件
    log('复制扩展文件...', 'blue');

    // 复制 manifest.json (如果在 dist 目录中存在)
    if (fs.existsSync(path.join(DIST_DIR, 'manifest.json'))) {
      copyFile(
        path.join(DIST_DIR, 'manifest.json'),
        path.join(EXTENSION_DIR, 'manifest.json')
      );
    }

    // 复制资源文件 (如果在 dist 目录中存在)
    if (fs.existsSync(path.join(DIST_DIR, 'assets'))) {
      copyDir(
        path.join(DIST_DIR, 'assets'),
        path.join(EXTENSION_DIR, 'assets')
      );
    }

    // 复制 HTML 文件到对应目录
    // 检查 popup 目录
    if (fs.existsSync(path.join(DIST_DIR, 'popup'))) {
      if (!fs.existsSync(path.join(EXTENSION_DIR, 'popup'))) {
        ensureDir(path.join(EXTENSION_DIR, 'popup'));
      }

      // 复制 HTML 文件
      if (fs.existsSync(path.join(DIST_DIR, 'popup', 'index.html'))) {
        copyFile(
          path.join(DIST_DIR, 'popup', 'index.html'),
          path.join(EXTENSION_DIR, 'popup', 'index.html')
        );
      }
    }

    // 检查 options 目录
    if (fs.existsSync(path.join(DIST_DIR, 'options'))) {
      if (!fs.existsSync(path.join(EXTENSION_DIR, 'options'))) {
        ensureDir(path.join(EXTENSION_DIR, 'options'));
      }

      // 复制 HTML 文件
      if (fs.existsSync(path.join(DIST_DIR, 'options', 'index.html'))) {
        copyFile(
          path.join(DIST_DIR, 'options', 'index.html'),
          path.join(EXTENSION_DIR, 'options', 'index.html')
        );
      }
    }

    // 检查 devtools 目录
    if (fs.existsSync(path.join(DIST_DIR, 'devtools'))) {
      if (!fs.existsSync(path.join(EXTENSION_DIR, 'devtools'))) {
        ensureDir(path.join(EXTENSION_DIR, 'devtools'));
      }

      // 复制 HTML 文件
      if (fs.existsSync(path.join(DIST_DIR, 'devtools', 'index.html'))) {
        copyFile(
          path.join(DIST_DIR, 'devtools', 'index.html'),
          path.join(EXTENSION_DIR, 'devtools', 'index.html')
        );
      }
    }

    // 复制 JS 文件
    // 检查 JS 文件是否在根目录或 assets 目录
    if (fs.existsSync(path.join(DIST_DIR, 'background.js'))) {
      copyFile(
        path.join(DIST_DIR, 'background.js'),
        path.join(EXTENSION_DIR, 'background.js')
      );
    } else if (fs.existsSync(path.join(DIST_DIR, 'assets', 'background.js'))) {
      copyFile(
        path.join(DIST_DIR, 'assets', 'background.js'),
        path.join(EXTENSION_DIR, 'background.js')
      );
    }

    if (fs.existsSync(path.join(DIST_DIR, 'content.js'))) {
      copyFile(
        path.join(DIST_DIR, 'content.js'),
        path.join(EXTENSION_DIR, 'content.js')
      );
    } else if (fs.existsSync(path.join(DIST_DIR, 'assets', 'content.js'))) {
      copyFile(
        path.join(DIST_DIR, 'assets', 'content.js'),
        path.join(EXTENSION_DIR, 'content.js')
      );
    }
  }

  // 打包扩展
  log('打包扩展...', 'blue');
  const zipFile = path.join(DIST_DIR, 'web-swiss-knife.zip');

  try {
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile);
    }

    // 使用不同平台的打包命令
    if (process.platform === 'win32') {
      // Windows
      exec(`powershell Compress-Archive -Path "${EXTENSION_DIR}/*" -DestinationPath "${zipFile}"`);
    } else {
      // Linux/Mac
      exec(`cd "${EXTENSION_DIR}" && zip -r "${zipFile}" ./*`);
    }

    log(`扩展已打包: ${zipFile}`, 'green');
  } catch (error) {
    log(`打包扩展失败: ${error.message}`, 'red');
  }

  log('构建完成!', 'green');
}

// 执行构建
buildExtension();
