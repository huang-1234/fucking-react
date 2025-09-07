#!/usr/bin/env node

/**
 * 发布脚本
 * 用于发布主包和子包
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const versionMap = {
  main: 'latest', // 正式版本
  beta: 'beta', // 测试版本
  alpha: 'alpha', // 预览版本
  inner: 'inner', // 内部版本
}

// 获取命令行参数
const args = process.argv.slice(2);
const packageArg = args[0] || 'all';
const versionBump = args[1] || 'patch';

// 解析包名和版本类型
let packageName, versionType;
if (packageArg.includes(':')) {
  [packageName, versionType] = packageArg.split(':');
} else {
  packageName = packageArg;
  versionType = 'main';
}

// 获取npm标签
const npmTag = versionMap[versionType] || 'latest';

// 支持的版本更新类型
const validVersionBumps = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

if (!validVersionBumps.includes(versionBump)) {
  console.error(`错误: 无效的版本更新类型 "${versionBump}"`);
  console.log(`有效的选项: ${validVersionBumps.join(', ')}`);
  process.exit(1);
}

// 检查npm登录状态
function checkNpmLogin() {
  try {
    const whoami = execSync('npm whoami', { stdio: 'pipe' }).toString().trim();
    console.log(`当前登录的npm账号: ${whoami}`);
    return true;
  } catch (error) {
    console.warn('您尚未登录npm账号，请先登录...');
    try {
      execSync('npm login', { stdio: 'inherit' });
      return true;
    } catch (loginError) {
      console.error('npm登录失败:', loginError.message);
      return false;
    }
  }
}

// 发布主包
function publishMainPackage() {
  try {
    console.log(`开始发布主包 (tag: ${npmTag})...`);

    // 构建项目
    execSync('npm run build', { stdio: 'inherit' });

    // 运行测试
    execSync('npm test', { stdio: 'inherit' });

    // 更新版本
    let versionCommand = `npm version ${versionBump}`;
    if (versionType !== 'main') {
      versionCommand = `npm version pre${versionBump} --preid=${versionType}`;
    }
    execSync(versionCommand, { stdio: 'inherit' });

    // 检查npm登录状态
    if (!checkNpmLogin()) {
      console.error('发布失败: 未登录npm账号');
      process.exit(1);
    }

    // 发布到npm
    try {
      execSync(`npm publish --access public --tag ${npmTag}`, { stdio: 'inherit' });
    } catch (publishError) {
      // 如果发布失败，尝试使用yarn发布
      console.log('使用npm发布失败，尝试使用yarn发布...');
      execSync(`yarn publish --access public --tag ${npmTag}`, { stdio: 'inherit' });
    }

    console.log(`主包发布成功! (tag: ${npmTag})`);
  } catch (error) {
    console.error('主包发布失败:', error.message);
    process.exit(1);
  }
}

// 发布service-work子包
function publishServiceWorkPackage() {
  try {
    console.log(`开始发布service-work子包 (tag: ${npmTag})...`);

    const mainPkgPath = path.resolve(__dirname, '../package.json');
    const serviceWorkPkgPath = path.resolve(__dirname, '../src/service-work/package.json');

    // 读取主包版本
    const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf-8'));
    const serviceWorkPkg = JSON.parse(fs.readFileSync(serviceWorkPkgPath, 'utf-8'));

    // 更新子包版本与主包保持一致
    serviceWorkPkg.version = mainPkg.version;

    // 写回子包package.json
    fs.writeFileSync(serviceWorkPkgPath, JSON.stringify(serviceWorkPkg, null, 2), 'utf-8');

    // 构建项目
    execSync('npm run build', { stdio: 'inherit' });

    // 进入子包目录
    process.chdir(path.resolve(__dirname, '../src/service-work'));

    // 检查npm登录状态
    if (!checkNpmLogin()) {
      console.error('发布失败: 未登录npm账号');
      process.exit(1);
    }

    // 发布子包
    try {
      execSync(`npm publish --access public --tag ${npmTag}`, { stdio: 'inherit' });
    } catch (publishError) {
      // 如果发布失败，尝试使用yarn发布
      console.log('使用npm发布失败，尝试使用yarn发布...');
      execSync(`yarn publish --access public --tag ${npmTag}`, { stdio: 'inherit' });
    }

    console.log(`service-work子包发布成功! (tag: ${npmTag})`);
  } catch (error) {
    console.error('service-work子包发布失败:', error.message);
    process.exit(1);
  }
}

// 检查是否有未提交的更改
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    if (status) {
      console.warn('警告: 存在未提交的更改，建议先提交或暂存更改再发布');
      const answer = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        answer.question('是否继续发布? (y/n): ', (ans) => {
          answer.close();
          if (ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes') {
            resolve(true);
          } else {
            console.log('发布已取消');
            resolve(false);
          }
        });
      });
    }
    return Promise.resolve(true);
  } catch (error) {
    console.warn('无法检查git状态，继续发布...');
    return Promise.resolve(true);
  }
}

// 主函数
async function main() {
  // 检查git状态
  const shouldContinue = await checkGitStatus();
  if (!shouldContinue) {
    process.exit(0);
  }

  // 根据参数执行不同的发布流程
  if (packageName === 'all') {
    publishMainPackage();
    publishServiceWorkPackage();
  } else if (packageName === 'main') {
    publishMainPackage();
  } else if (packageName === 'service-work') {
    publishServiceWorkPackage();
  } else {
    console.error(`错误: 未知的包名 "${packageName}"`);
    console.log('有效的选项: main, service-work, all');
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('发布过程中出现错误:', error);
  process.exit(1);
});