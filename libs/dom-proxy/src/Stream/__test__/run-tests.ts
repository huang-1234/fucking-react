/**
 * Stream模块测试运行脚本
 * 提供不同的测试运行模式和报告生成
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 测试运行选项
 */
interface TestRunOptions {
  /** 测试模式 */
  mode: 'unit' | 'integration' | 'performance' | 'compatibility' | 'all';
  /** 是否生成覆盖率报告 */
  coverage: boolean;
  /** 是否监听文件变化 */
  watch: boolean;
  /** 是否生成详细报告 */
  verbose: boolean;
  /** 输出目录 */
  outputDir: string;
  /** 是否在浏览器中打开报告 */
  openReport: boolean;
}

/**
 * 默认测试选项
 */
const DEFAULT_OPTIONS: TestRunOptions = {
  mode: 'all',
  coverage: true,
  watch: false,
  verbose: false,
  outputDir: './test-output',
  openReport: false
};

/**
 * 测试套件配置
 */
const TEST_SUITES = {
  unit: [
    'BinaryData.test.ts',
    'StreamOperations.test.ts',
    'DataTransfer.test.ts',
    'CompatibilityManager.test.ts'
  ],
  integration: [
    'integration.test.ts'
  ],
  performance: [
    'performance.test.ts'
  ],
  compatibility: [
    'compatibility.test.ts'
  ],
  all: [
    '**/*.test.ts'
  ]
};

/**
 * 测试运行器类
 */
class TestRunner {
  private options: TestRunOptions;

  constructor(options: Partial<TestRunOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 运行测试
   */
  async run(): Promise<void> {
    console.log('🚀 Starting Stream module tests...');
    console.log(`Mode: ${this.options.mode}`);
    console.log(`Coverage: ${this.options.coverage ? 'enabled' : 'disabled'}`);
    console.log(`Watch: ${this.options.watch ? 'enabled' : 'disabled'}`);
    console.log('');

    // 确保输出目录存在
    this.ensureOutputDir();

    // 构建测试命令
    const command = this.buildTestCommand();

    try {
      // 运行测试
      await this.executeCommand(command);

      // 生成报告
      if (this.options.coverage) {
        await this.generateReports();
      }

      console.log('✅ Tests completed successfully!');

      // 打开报告
      if (this.options.openReport && this.options.coverage) {
        await this.openCoverageReport();
      }

    } catch (error) {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    }
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDir(): void {
    if (!existsSync(this.options.outputDir)) {
      mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  /**
   * 构建测试命令
   */
  private buildTestCommand(): string[] {
    const command = ['vitest'];

    // 添加测试文件模式
    const testFiles = TEST_SUITES[this.options.mode];
    if (testFiles && this.options.mode !== 'all') {
      command.push(...testFiles);
    }

    // 添加选项
    if (!this.options.watch) {
      command.push('--run');
    }

    if (this.options.coverage) {
      command.push('--coverage');
    }

    if (this.options.verbose) {
      command.push('--reporter=verbose');
    }

    // 添加配置文件
    command.push('--config', './vitest.config.ts');

    return command;
  }

  /**
   * 执行命令
   */
  private executeCommand(command: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('npx', command, {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 生成测试报告
   */
  private async generateReports(): Promise<void> {
    console.log('📊 Generating test reports...');

    // 生成测试摘要
    const summary = this.generateTestSummary();
    const summaryPath = join(this.options.outputDir, 'test-summary.json');
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`📄 Test summary saved to: ${summaryPath}`);
  }

  /**
   * 生成测试摘要
   */
  private generateTestSummary(): any {
    return {
      timestamp: new Date().toISOString(),
      mode: this.options.mode,
      coverage: this.options.coverage,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      configuration: this.options
    };
  }

  /**
   * 打开覆盖率报告
   */
  private async openCoverageReport(): Promise<void> {
    const reportPath = join(process.cwd(), 'coverage', 'index.html');

    if (existsSync(reportPath)) {
      console.log('🌐 Opening coverage report in browser...');

      try {
        // const open = require('open');
        // await open(reportPath);
        console.log('📊 Coverage report available at:', reportPath);
      } catch (error) {
        console.warn('⚠️  Could not open browser. Please open manually:', reportPath);
      }
    } else {
      console.warn('⚠️  Coverage report not found');
    }
  }
}

/**
 * 命令行接口
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: Partial<TestRunOptions> = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--mode':
        options.mode = args[++i] as TestRunOptions['mode'];
        break;
      case '--no-coverage':
        options.coverage = false;
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      case '--open':
        options.openReport = true;
        break;
      case '--help':
        printHelp();
        return;
    }
  }

  const runner = new TestRunner(options);
  await runner.run();
}

/**
 * 打印帮助信息
 */
function printHelp(): void {
  console.log(`
Stream Module Test Runner

Usage: npm run test [options]

Options:
  --mode <mode>      Test mode: unit, integration, performance, compatibility, all (default: all)
  --no-coverage      Disable coverage reporting
  --watch            Watch for file changes
  --verbose          Verbose output
  --output <dir>     Output directory (default: ./test-output)
  --open             Open coverage report in browser
  --help             Show this help message

Examples:
  npm run test                           # Run all tests with coverage
  npm run test -- --mode unit           # Run only unit tests
  npm run test -- --watch               # Run tests in watch mode
  npm run test -- --mode performance --no-coverage  # Run performance tests without coverage
  npm run test -- --open                # Run tests and open coverage report
`);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { TestRunner, TEST_SUITES };
export type { TestRunOptions };