#!/usr/bin/env node

/**
 * SecLinter 发布脚本
 * 用于发布主包和子包
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 版本标签映射
const versionMap = {
  main: 'latest',  // 正式版本
  beta: 'beta',    // 测试版本
  alpha: 'alpha',  // 预览版本
  inner: 'inner',  // 内部版本
};

// 支持的版本更新类型
const validVersionBumps = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

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
 * 提问函数
 * @param {string} question 问题
 * @returns {Promise<string>} 用户输入
 */
function question(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 读取package.json
 * @param {string} pkgPath 路径
 * @returns {object} package.json内容
 */
function readPackageJson(pkgPath) {
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch (error) {
    log(`读取package.json失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * 检查Git工作区状态
 */
function checkGitStatus() {
  log('检查Git工作区状态...', 'blue');

  try {
    const status = exec('git status --porcelain', true);

    if (status.trim()) {
      log('工作区有未提交的更改:', 'yellow');
      console.log(status);

      return false;
    }

    log('Git工作区干净', 'green');
    return true;
  } catch (error) {
    log(`检查Git状态失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 发布主包
 * @param {string} versionType 版本类型
 * @param {string} versionBump 版本更新类型
 */
async function publishMainPackage(versionType, versionBump) {
  const npmTag = versionMap[versionType] || 'latest';

  try {
    log(`开始发布主包 (tag: ${npmTag})...`, 'blue');

    // 构建项目
    log('构建项目...', 'blue');
    exec('node scripts/build.js');

    // 运行测试
    log('运行测试...', 'blue');
    exec('npm test');

    // 更新版本
    log(`更新版本 (${versionBump})...`, 'blue');
    let versionCommand = `npm version ${versionBump} --no-git-tag-version`;
    if (versionType !== 'main' && !versionBump.startsWith('pre')) {
      versionCommand = `npm version pre${versionBump} --preid=${versionType} --no-git-tag-version`;
    }
    exec(versionCommand);

    // 读取更新后的版本
    const packageJson = readPackageJson(path.resolve(__dirname, '../package.json'));
    const newVersion = packageJson.version;

    // 确认发布
    const confirmPublish = await question(`确认发布 v${newVersion} (tag: ${npmTag})? (y/N): `);
    if (confirmPublish.toLowerCase() !== 'y') {
      log('发布已取消', 'yellow');
      return;
    }

    // 发布到npm
    log('发布到NPM...', 'blue');
    exec(`npm publish --access public --tag ${npmTag}`);

    // 提交并推送更改
    log('提交版本更新...', 'blue');
    exec(`git add package.json`);
    exec(`git commit -m "chore: release v${newVersion}"`);

    log('创建Git标签...', 'blue');
    exec(`git tag -a v${newVersion} -m "version ${newVersion}"`);

    log('推送到远程仓库...', 'blue');
    exec('git push');
    exec('git push --tags');

    log(`主包 v${newVersion} 发布成功! (tag: ${npmTag})`, 'green');
    return newVersion;
  } catch (error) {
    log(`主包发布失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * 发布plugins子包
 * @param {string} mainVersion 主版本号
 * @param {string} versionType 版本类型
 */
async function publishPluginsPackage(mainVersion, versionType) {
  const npmTag = versionMap[versionType] || 'latest';

  try {
    log(`开始发布plugins子包 (tag: ${npmTag})...`, 'blue');

    const pluginsPkgPath = path.resolve(__dirname, '../plugins/package.json');

    // 检查子包package.json是否存在
    if (!fs.existsSync(pluginsPkgPath)) {
      // 创建子包package.json
      const mainPkg = readPackageJson(path.resolve(__dirname, '../package.json'));
      const pluginsPkg = {
        name: 'seclinter-plugins',
        version: mainVersion,
        description: 'SecLinter插件系统',
        main: 'index.js',
        types: 'index.d.ts',
        author: mainPkg.author,
        license: mainPkg.license,
        dependencies: {
          seclinter: `^${mainVersion}`
        },
        peerDependencies: {
          vite: '>=4.0.0',
          webpack: '>=5.0.0'
        }
      };

      fs.writeFileSync(pluginsPkgPath, JSON.stringify(pluginsPkg, null, 2), 'utf-8');
    } else {
      // 更新子包版本与主包保持一致
      const pluginsPkg = readPackageJson(pluginsPkgPath);
      pluginsPkg.version = mainVersion;
      if (pluginsPkg.dependencies && pluginsPkg.dependencies.seclinter) {
        pluginsPkg.dependencies.seclinter = `^${mainVersion}`;
      }

      fs.writeFileSync(pluginsPkgPath, JSON.stringify(pluginsPkg, null, 2), 'utf-8');
    }

    // 进入子包目录
    process.chdir(path.resolve(__dirname, '../plugins'));

    // 发布子包
    exec(`npm publish --access public --tag ${npmTag}`);

    // 返回主目录
    process.chdir(path.resolve(__dirname, '..'));

    log(`plugins子包 v${mainVersion} 发布成功! (tag: ${npmTag})`, 'green');
  } catch (error) {
    log(`plugins子包发布失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  log('=== SecLinter 发布脚本 ===', 'magenta');

  // 解析命令行参数
  const args = process.argv.slice(2);
  let packageName = 'all';
  let versionType = 'main';
  let versionBump = 'patch';

  if (args.length > 0) {
    if (args[0].includes(':')) {
      const parts = args[0].split(':');
      packageName = parts[0];
      versionType = parts[1];
    } else {
      packageName = args[0];
    }

    if (args.length > 1) {
      versionBump = args[1];
    }
  }

  // 验证版本更新类型
  if (!validVersionBumps.includes(versionBump)) {
    log(`错误: 无效的版本更新类型 "${versionBump}"`, 'red');
    log(`有效的选项: ${validVersionBumps.join(', ')}`, 'yellow');
    process.exit(1);
  }

  // 检查Git状态
  if (!checkGitStatus()) {
    const answer = await question('工作区有未提交的更改，是否继续? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      log('发布已取消', 'yellow');
      process.exit(0);
    }
  }

  let mainVersion;

  // 根据参数执行不同的发布流程
  if (packageName === 'all' || packageName === 'main') {
    mainVersion = await publishMainPackage(versionType, versionBump);
  }

  if ((packageName === 'all' || packageName === 'plugins') && mainVersion) {
    await publishPluginsPackage(mainVersion, versionType);
  }

  log('\n✅ SecLinter 发布完成!', 'green');
  rl.close();
}

// 执行主函数
main().catch((error) => {
  log(`发生错误: ${error.message}`, 'red');
  process.exit(1);
});