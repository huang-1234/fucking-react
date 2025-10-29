#!/usr/bin/env node

/**
 * Universal NPM Package Publisher - Single File Version
 * 一个完整的 npm 包发布工具，合并为单一文件便于本地调试
 * 支持多包管理、语义化版本、Git 集成等功能
 */

// 依赖引入
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const commander = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const semver = require('semver');
const ora = require('ora');

// 获取命令行程序实例
const program = new commander.Command();

// 颜色配置
const colors = {
  red: chalk.red,
  green: chalk.green,
  yellow: chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  cyan: chalk.cyan,
  white: chalk.white,
};

/**
 * 交互管理器 - 处理用户输入和输出
 */
class InteractionManager {
  static log(message, color = 'white') {
    console.log(colors[color] ? colors[color](message) : message);
  }

  static error(message) {
    this.log(`错误: ${message}`, 'red');
  }

  static success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  static warning(message) {
    this.log(`⚠️ ${message}`, 'yellow');
  }

  static info(message) {
    this.log(`ℹ️ ${message}`, 'blue');
  }

  static async prompt(questions) {
    return await inquirer.prompt(questions);
  }

  static async confirm(message, defaultValue = false) {
    const { confirmed } = await this.prompt({
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    });
    return confirmed;
  }

  static async selectVersion(currentVersion, preId = 'beta') {
    const choices = [
      {
        name: `Patch (${currentVersion} → ${semver.inc(currentVersion, 'patch')}) - Bug 修复`,
        value: { type: 'patch', tag: 'latest' },
      },
      {
        name: `Minor (${currentVersion} → ${semver.inc(currentVersion, 'minor')}) - 新功能`,
        value: { type: 'minor', tag: 'latest' },
      },
      {
        name: `Major (${currentVersion} → ${semver.inc(currentVersion, 'major')}) - 重大变更`,
        value: { type: 'major', tag: 'latest' },
      },
      {
        name: `预发布 (${currentVersion} → ${semver.inc(currentVersion, 'prerelease', preId)}) - Alpha/Beta`,
        value: { type: 'prerelease', tag: preId },
      },
    ];

    const { version } = await this.prompt({
      type: 'list',
      name: 'version',
      message: `选择版本类型 (当前: ${currentVersion}):`,
      choices,
    });

    return version;
  }
}

/**
 * 配置管理器 - 处理配置文件加载和验证
 */
class ConfigManager {
  constructor(configPath = './publish.config.js') {
    this.configPath = path.resolve(process.cwd(), configPath);
    this.defaultConfig = {
      packages: [],
      version: { bump: 'prompt', preId: 'alpha' },
      git: { createTag: false, tagPrefix: 'v', autoCommit: false },
      npm: { registry: 'https://registry.npmjs.org/', access: 'public' },
    };
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const userConfig = require(this.configPath);
        return { ...this.defaultConfig, ...userConfig };
      }

      // 创建默认配置文件
      this.createDefaultConfig();
      InteractionManager.warning(`已创建默认配置文件: ${this.configPath}`);
      return this.defaultConfig;
    } catch (error) {
      InteractionManager.error(`加载配置失败: ${error.message}`);
      return this.defaultConfig;
    }
  }

  createDefaultConfig() {
    const configTemplate = `module.exports = ${JSON.stringify(this.defaultConfig, null, 2)}`;
    fs.writeFileSync(this.configPath, configTemplate, 'utf8');
  }

  validateConfig(config) {
    if (!config.packages || !Array.isArray(config.packages)) {
      throw new Error('无效配置: packages 必须是数组');
    }
    return config;
  }
}

/**
 * 版本管理器 - 处理语义化版本控制
 */
class VersionManager {
  static async getNextVersion(currentVersion, versionType, preId) {
    if (!semver.valid(currentVersion)) {
      throw new Error(`无效的当前版本: ${currentVersion}`);
    }

    let newVersion;

    switch (versionType) {
      case 'patch': newVersion = semver.inc(currentVersion, 'patch'); break;
      case 'minor': newVersion = semver.inc(currentVersion, 'minor'); break;
      case 'major': newVersion = semver.inc(currentVersion, 'major'); break;
      case 'prerelease': newVersion = semver.inc(currentVersion, 'prerelease', preId); break;
      case 'prepatch': newVersion = semver.inc(currentVersion, 'prepatch', preId); break;
      case 'preminor': newVersion = semver.inc(currentVersion, 'preminor', preId); break;
      case 'premajor': newVersion = semver.inc(currentVersion, 'premajor', preId); break;
      default: newVersion = await this.promptVersionType(currentVersion, preId);
    }

    return newVersion;
  }

  static async promptVersionType(currentVersion, preId) {
    const choices = [
      { name: `Patch (${currentVersion} → ${semver.inc(currentVersion, 'patch')}) - Bug 修复`, value: 'patch' },
      { name: `Minor (${currentVersion} → ${semver.inc(currentVersion, 'minor')}) - 新功能`, value: 'minor' },
      { name: `Major (${currentVersion} → ${semver.inc(currentVersion, 'major')}) - 重大变更`, value: 'major' },
      { name: `预发布 (${currentVersion} → ${semver.inc(currentVersion, 'prerelease', preId)})`, value: 'prerelease' },
    ];

    const { versionType } = await InteractionManager.prompt({
      type: 'list',
      name: 'versionType',
      message: `选择版本类型 (当前: ${currentVersion}):`,
      choices,
    });

    return this.getNextVersion(currentVersion, versionType, preId);
  }

  static updatePackageVersion(packagePath, newVersion) {
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json 未找到: ${packageJsonPath}`);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    InteractionManager.success(`更新 ${path.basename(packagePath)} 版本为: ${newVersion}`);
    return packageJson;
  }

  static getCurrentVersion(packagePath) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  }
}

/**
 * Git 管理器 - 处理 Git 相关操作
 */
class GitManager {
  static checkStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();

      if (status) {
        InteractionManager.warning('Git 工作区不干净:');
        InteractionManager.warning(status);
        return false;
      }

      InteractionManager.success('Git 工作区干净');
      return true;
    } catch (error) {
      throw new Error(`Git 状态检查失败: ${error.message}`);
    }
  }

  static commitChanges(version, message) {
    try {
      execSync('git add .', { stdio: 'inherit' });
      const commitMessage = message || `chore: 发布 v${version}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      InteractionManager.success(`提交 v${version} 的更改`);
    } catch (error) {
      throw new Error(`Git 提交失败: ${error.message}`);
    }
  }

  static createTag(version, prefix = 'v') {
    try {
      const tagName = `${prefix}${version}`;
      execSync(`git tag -a ${tagName} -m "版本 ${version}"`, { stdio: 'inherit' });
      InteractionManager.success(`创建标签: ${tagName}`);
      return tagName;
    } catch (error) {
      throw new Error(`Git 标签创建失败: ${error.message}`);
    }
  }

  static pushWithTags() {
    try {
      execSync('git push', { stdio: 'inherit' });
      execSync('git push --tags', { stdio: 'inherit' });
      InteractionManager.success('推送更改和标签到远程仓库');
    } catch (error) {
      throw new Error(`Git 推送失败: ${error.message}`);
    }
  }
}

/**
 * NPM 发布器 - 处理 NPM 发布相关操作
 */
class NpmPublisher {
  static checkLogin(_registry) {
    try {
      execSync('mnpm whoami', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async publishPackage(packagePath, tag = 'latest', registry, dryRun = false) {
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json 未在找到: ${packagePath}`);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageName = packageJson.name;

    InteractionManager.info(`发布 ${packageName}，标签: ${tag}`);

    if (dryRun) {
      InteractionManager.warning(`[干运行] 将发布 ${packageName}@${packageJson.version}，标签: ${tag}`);
      return true;
    }

    try {
      const registryFlag = registry ? `--registry ${registry}` : '';
      const tagFlag = tag !== 'latest' ? `--tag ${tag}` : '';

      execSync(`mnpm publish ${registryFlag} ${tagFlag} --access public`, {
        cwd: packagePath,
        stdio: 'inherit',
      });

      InteractionManager.success(`成功发布 ${packageName}@${packageJson.version}`);
      return true;
    } catch (error) {
      throw new Error(`发布失败 ${packageName}: ${error.message}`);
    }
  }

  static runScripts(packagePath, scripts) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    scripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        InteractionManager.info(`运行脚本: ${script}`);
        try {
          execSync(`npm run ${script}`, { cwd: packagePath, stdio: 'inherit' });
        } catch (error) {
          throw new Error(`脚本 ${script} 执行失败: ${error.message}`);
        }
      }
    });
  }

  static getNpmTag(version) {
    if (version.includes('-alpha')) return 'alpha';
    if (version.includes('-beta')) return 'beta';
    if (version.includes('-rc')) return 'rc';
    if (version.includes('-')) return 'next';
    return 'latest';
  }

  /**
   * 判断版本类型
   * @param {string} version - 版本号
   * @returns {string} - 版本类型: 'alpha', 'beta', 'rc', 'latest'
   */
  static getVersionType(version) {
    if (version.includes('-alpha')) return 'alpha';
    if (version.includes('-beta')) return 'beta';
    if (version.includes('-rc')) return 'rc';
    return 'latest';
  }

  /**
   * 判断是否为预发布版本
   * @param {string} version - 版本号
   * @returns {boolean} - 是否为预发布版本
   */
  static isPrerelease(version) {
    return version.includes('-');
  }

  /**
   * 判断是否为正式版本
   * @param {string} version - 版本号
   * @returns {boolean} - 是否为正式版本
   */
  static isStable(version) {
    return !version.includes('-');
  }

  /**
   * 根据版本类型获取发布策略
   * @param {string} version - 版本号
   * @returns {Object} - 发布策略
   */
  static getPublishStrategy(version) {
    const versionType = this.getVersionType(version);
    const isPrerelease = this.isPrerelease(version);
    const isStable = this.isStable(version);

    return {
      versionType,
      isPrerelease,
      isStable,
      tag: this.getNpmTag(version),
      shouldCreateGitTag: isStable, // 只有正式版本才创建 Git 标签
      shouldAutoCommit: isStable, // 只有正式版本才自动提交
      description: this.getVersionDescription(versionType, isPrerelease, isStable),
    };
  }

  /**
   * 获取版本描述
   * @param {string} versionType - 版本类型
   * @param {boolean} isPrerelease - 是否为预发布版本
   * @param {boolean} isStable - 是否为正式版本
   * @returns {string} - 版本描述
   */
  static getVersionDescription(versionType, isPrerelease, isStable) {
    if (isStable) {
      return '正式版本 - 将发布到 latest 标签，并创建 Git 标签';
    }

    switch (versionType) {
      case 'alpha':
        return 'Alpha 版本 - 将发布到 alpha 标签，不创建 Git 标签';
      case 'beta':
        return 'Beta 版本 - 将发布到 beta 标签，不创建 Git 标签';
      case 'rc':
        return 'RC 版本 - 将发布到 rc 标签，不创建 Git 标签';
      default:
        return '预发布版本 - 将发布到 next 标签，不创建 Git 标签';
    }
  }

  /**
   * 验证版本发布策略
   * @param {Object} config - 配置对象
   * @param {string} version - 版本号
   * @returns {Object} - 验证结果
   */
  static validatePublishStrategy(config, version) {
    const strategy = this.getPublishStrategy(version);

    // 检查 Git 配置是否与版本策略匹配
    const gitConfig = config.git || {};
    const warnings = [];

    if (strategy.isPrerelease && gitConfig.createTag) {
      warnings.push('预发布版本通常不建议创建 Git 标签');
    }

    if (strategy.isStable && !gitConfig.createTag) {
      warnings.push('正式版本建议创建 Git 标签');
    }

    return {
      strategy,
      warnings,
      isValid: warnings.length === 0,
    };
  }
}

/**
 * 变更日志管理器 - 处理 CHANGELOG 更新
 */
class ChangelogManager {
  static updateChangelog(packagePath, version, changes = {}) {
    const changelogPath = path.join(packagePath, 'CHANGELOG.md');
    const releaseDate = new Date().toISOString().split('T')[0];

    const newEntry = this.generateChangelogEntry(version, releaseDate, changes);

    if (fs.existsSync(changelogPath)) {
      const currentContent = fs.readFileSync(changelogPath, 'utf8');
      const updatedContent = this.insertNewEntry(currentContent, newEntry);
      fs.writeFileSync(changelogPath, updatedContent, 'utf8');
    } else {
      fs.writeFileSync(changelogPath, newEntry, 'utf8');
    }

    InteractionManager.success(`更新 CHANGELOG.md 版本 v${version}`);
  }

  static generateChangelogEntry(version, date, changes) {
    return `# 变更日志

此项目所有显著变更将记录在此文件中。

格式基于 https://keepachangelog.com/，
且此项目遵循 https://semver.org/。

## [${version}] - ${date}

### 新增
- ${changes.added || '新功能和改进'}

### 变更
- ${changes.changed || '各项改进和优化'}

### 修复
- ${changes.fixed || 'Bug 修复和稳定性改进'}

`;
  }

  static insertNewEntry(currentContent, newEntry) {
    const lines = currentContent.split('\n');
    if (lines.length > 0 && lines[0].startsWith('# 变更日志')) {
      return newEntry + currentContent.replace('# 变更日志\n\n', '');
    }
    return newEntry + currentContent;
  }
}

/**
 * 命令查看器 - 查看内部命令和功能
 */
class CommandViewer {
  static showCommands() {
    console.log(colors.cyan.bold('\n🚀 Universal Publisher - 内部命令和功能\n'));

    console.log(colors.yellow.bold('📋 主要功能:'));
    console.log('  • 多包管理 - 支持同时发布多个 npm 包');
    console.log('  • 语义化版本控制 - 自动处理版本号递增');
    console.log('  • Git 集成 - 自动提交、打标签和推送');
    console.log('  • NPM 发布 - 自动发布到 npm registry');
    console.log('  • 变更日志更新 - 自动生成 CHANGELOG.md');
    console.log('  • 配置管理 - 支持自定义发布配置');
    console.log('  • 钩子支持 - 支持前置和后置发布脚本');
    console.log('  • 干运行模式 - 模拟发布流程不实际执行');
    console.log('  • 版本类型识别 - 自动识别 alpha/beta/正式版本并应用相应策略');

    console.log(colors.yellow.bold('\n🔧 支持的命令行选项:'));
    console.log('  -c, --config <path>     配置文件路径 (默认: ./publish.config.js)');
    console.log('  --dry-run               模拟发布而不实际执行');
    console.log('  --no-test               跳过测试');
    console.log('  --no-git                跳过 git 操作');
    console.log('  --commands              查看内部命令和功能');
    console.log('  -h, --help              显示帮助信息');
    console.log('  -V, --version           显示版本信息');

    console.log(colors.yellow.bold('\n📦 支持的参数:'));
    console.log('  [package]               要发布的包名称 (默认: 全部)');
    console.log('  [version-type]          版本类型: patch, minor, major, prerelease 等');

    console.log(colors.yellow.bold('\n🏷️  支持的版本类型:'));
    console.log('  patch       - 补丁版本 (bug 修复)');
    console.log('  minor       - 次要版本 (新功能)');
    console.log('  major       - 主要版本 (重大变更)');
    console.log('  prerelease  - 预发布版本 (alpha/beta)');
    console.log('  prepatch    - 预发布补丁版本');
    console.log('  preminor    - 预发布次要版本');
    console.log('  premajor    - 预发布主要版本');

    console.log(colors.yellow.bold('\n📂 类结构:'));
    console.log('  InteractionManager      - 交互管理器');
    console.log('  ConfigManager           - 配置管理器');
    console.log('  VersionManager          - 版本管理器');
    console.log('  GitManager              - Git 操作管理器');
    console.log('  NpmPublisher            - NPM 发布管理器');
    console.log('  ChangelogManager        - 变更日志管理器');
    console.log('  UniversalPublisher      - 主发布协调器');
    console.log('  CommandViewer           - 命令查看器 (新增)');

    console.log(colors.yellow.bold('\n📖 使用示例:'));
    console.log('  node publish-enhanced.js --help                  # 显示帮助信息');
    console.log('  node publish-enhanced.js commands                # 查看内部命令和功能');
    console.log('  node publish-enhanced.js                         # 发布所有包 (交互式选择版本)');
    console.log('  node publish-enhanced.js my-package minor        # 发布指定包的次要版本');
    console.log('  node publish-enhanced.js --dry-run               # 干运行模式');
    console.log('  node publish-enhanced.js --no-git                # 跳过 Git 操作');
    console.log('  node publish-enhanced.js --config ./config.js    # 使用自定义配置文件');
    console.log('  node publish-enhanced.js my-package --dry-run    # 干运行发布指定包');

    console.log(colors.green.bold('\n✅ 完成命令信息展示\n'));
  }
}

/**
 * 主发布协调器 - 协调整个发布流程
 */
class UniversalPublisher {
  constructor(options = {}) {
    this.options = options;
    this.configManager = new ConfigManager(options.configPath);
    this.config = null;
    this.spinner = ora();
  }

  async publish() {
    try {
      console.log('开始执行 publish 方法');
      InteractionManager.log('🚀 Universal Publisher 启动中...', 'magenta');

      // 加载配置
      console.log('加载配置');
      this.config = this.configManager.loadConfig();
      console.log('配置加载完成:', this.config);

      // 环境检查
      console.log('开始环境检查');
      await this.checkEnvironment();
      console.log('环境检查完成');

      // Git 状态检查
      if (!this.options.skipGit) {
        console.log('开始 Git 状态检查');
        const isClean = GitManager.checkStatus();
        if (!isClean && !await InteractionManager.confirm('工作区有更改。继续?')) {
          InteractionManager.warning('发布已取消');
          return;
        }
      }

      // 选择包和版本
      console.log('开始选择包和版本');
      const { selectedPackages, versionInfo } = await this.selectPackagesAndVersion();
      console.log('完成选择包和版本:', { selectedPackages, versionInfo });

      // 确认发布
      if (!await this.confirmPublish(selectedPackages, versionInfo)) {
        InteractionManager.warning('发布已取消');
        return;
      }

      // 执行发布流程
      for (const pkg of selectedPackages) {
        await this.publishPackage(pkg, versionInfo);
      }

      // Git 操作
      if (!this.options.skipGit && !this.options.dryRun) {
        await this.performGitOperations(versionInfo.finalVersion);
      }

      InteractionManager.success('所有包发布成功!');

    } catch (error) {
      InteractionManager.error(`发布失败: ${error.message}`);
      console.error('发布失败的错误详情:', error);
      throw error;
    }
  }

  async checkEnvironment() {
    // 检查 npm 登录状态
    // if (!NpmPublisher.checkLogin(this.config.npm.registry)) {
    //   throw new Error('未登录 npm。请运行: npm login');
    // }

    // 检查 Node.js 版本
    const currentNodeVersion = process.versions.node;

    if (semver.lt(currentNodeVersion, '14.0.0')) {
      throw new Error('需要 Node.js 版本 14.0.0 或更高');
    }
  }

  async selectPackagesAndVersion() {
    const packages = this.config.packages;

    if (packages.length === 0) {
      // 如果没有配置包，使用当前目录作为默认包
      const defaultPackage = {
        name: path.basename(process.cwd()),
        path: process.cwd(),
      };

      // 获取版本信息
      const versionInfo = await this.getVersionInfo(defaultPackage);
      return { selectedPackages: [defaultPackage], versionInfo };
    }

    let selectedPackages = packages;

    // 如果指定了特定包，则过滤
    if (this.options.packageName && this.options.packageName !== 'all') {
      selectedPackages = packages.filter(pkg =>
        pkg.name === this.options.packageName);
    }

    // 获取版本信息
    const versionInfo = await this.getVersionInfo(selectedPackages[0]);

    return { selectedPackages, versionInfo };
  }

  async getVersionInfo(basePackage) {
    const currentVersion = VersionManager.getCurrentVersion(basePackage.path);
    console.log('getVersionInfo', this.config.version, this.options.versionType);
    let nextVersion;
    if (this.options.versionType === 'prompt') {
      nextVersion = await VersionManager.promptVersionType(
        currentVersion,
        this.config.version.preId,
      );
    } else {
      nextVersion = await VersionManager.getNextVersion(
        currentVersion,
        this.options.versionType,
        this.config.version.preId,
      );
    }

    const npmTag = NpmPublisher.getNpmTag(nextVersion);

    return {
      currentVersion,
      nextVersion,
      finalVersion: nextVersion,
      npmTag,
    };
  }

  async confirmPublish(packages, versionInfo) {
    InteractionManager.log('\n📦 要发布的包:', 'cyan');
    packages.forEach(pkg => {
      InteractionManager.log(`  - ${pkg.name} (${pkg.path})`, 'cyan');
    });

    InteractionManager.log(`\n🔄 版本: ${versionInfo.currentVersion} → ${versionInfo.finalVersion}`, 'cyan');
    InteractionManager.log(`🏷️  NPM 标签: ${versionInfo.npmTag}`, 'cyan');

    // 显示版本策略信息
    const strategy = NpmPublisher.getPublishStrategy(versionInfo.finalVersion);
    InteractionManager.log(`📝 版本策略: ${strategy.description}`, 'cyan');

    if (this.options.dryRun) {
      InteractionManager.warning('🔶 干运行模式 - 不会实际更改');
    }

    // 验证发布策略
    const validation = NpmPublisher.validatePublishStrategy(this.config, versionInfo.finalVersion);
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        InteractionManager.warning(`⚠️  ${warning}`);
      });
    }

    return await InteractionManager.confirm('确认发布?');
  }

  async publishPackage(pkg, versionInfo) {
    InteractionManager.log(`\n📦 发布 ${pkg.name}...`, 'blue');

    const packagePath = pkg.path;

    // 更新版本号
    VersionManager.updatePackageVersion(packagePath, versionInfo.finalVersion);

    // 运行前置钩子
    if (pkg.prePublishHooks) {
      NpmPublisher.runScripts(packagePath, pkg.prePublishHooks);
    }

    // 更新变更日志
    ChangelogManager.updateChangelog(packagePath, versionInfo.finalVersion);

    // 发布到 npm
    await NpmPublisher.publishPackage(
      packagePath,
      versionInfo.npmTag,
      this.config.npm.registry,
      this.options.dryRun,
    );

    // 运行后置钩子
    if (pkg.postPublishHooks) {
      NpmPublisher.runScripts(packagePath, pkg.postPublishHooks);
    }
  }

  async performGitOperations(version) {
    if (this.config.git.autoCommit) {
      GitManager.commitChanges(version);
    }

    if (this.config.git.createTag) {
      GitManager.createTag(version, this.config.git.tagPrefix);
    }

    GitManager.pushWithTags();
  }
}

// CLI 配置和主函数
program
  .name('universal-publisher')
  .description('通用 npm 包发布工具')
  .version('1.0.0')
  .option('-c, --config <path>', '配置文件路径', './publish.config.js')
  .option('--dry-run', '模拟发布而不实际执行')
  .option('--no-test', '跳过测试')
  .option('--no-git', '跳过 git 操作')
  .arguments('[package] [version-type]')
  .action(async (packageName, versionType, cmd) => {
    // 获取选项对象
    const options = cmd;
    console.log('进入命令处理函数');
    console.log('packageName:', packageName);
    console.log('versionType:', versionType);
    // console.log('options:', options);

    // 检查是否正确获取了选项
    if (!options) {
      console.error('无法获取选项对象');
      process.exit(1);
    }

    try {
      console.log('创建发布器实例');
      const publisher = new UniversalPublisher({
        packageName: packageName || 'all',
        versionType: versionType || 'patch',
        configPath: options.config,
        dryRun: options.dryRun,
        skipTests: options.test === false,
        skipGit: options.git === false,
      });
      console.log('发布器实例创建完成');

      console.log('开始执行发布流程');
      await publisher.publish();
      console.log('发布流程执行完成');
    } catch (error) {
      InteractionManager.error(`错误: ${error.message}`);
      process.exit(1);
    }
  });

// 添加一个独立的命令来查看内部命令和功能
program
  .command('commands')
  .description('查看内部命令和功能')
  .action(() => {
    console.log('显示命令信息');
    CommandViewer.showCommands();
  });

// 添加一个独立的命令来查看内部命令和功能
// program
//   .command('commands')
//   .description('查看内部命令和功能')
//   .action(() => {
//     console.log('显示命令信息');
//     CommandViewer.showCommands();
//   });

// 主执行函数
function main() {
  console.log('开始执行主函数');
  try {
    // 检查是否是直接运行此文件
    if (require.main === module) {
      console.log('解析命令行参数');
      program.parse(process.argv);
    }
  } catch (error) {
    InteractionManager.error(`致命错误: ${error.message}`);
    process.exit(1);
  }
}

// 导出所有类以便其他模块使用（如果需要在其他文件中引用）
module.exports = {
  InteractionManager,
  ConfigManager,
  VersionManager,
  GitManager,
  NpmPublisher,
  ChangelogManager,
  UniversalPublisher,
  CommandViewer,
  main,
};

// 如果直接运行此文件，则执行主函数
console.log('检查是否直接运行此文件');
if (require.main === module) {
  console.log('直接运行此文件，执行主函数');
  main();
} else {
  console.log('作为模块引入');
}
