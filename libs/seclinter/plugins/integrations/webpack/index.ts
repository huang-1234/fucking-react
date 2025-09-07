/**
 * SecLinter Webpack 插件集成
 */
import { Compiler, WebpackPluginInstance } from 'webpack';
import { createPluginManager } from '../../core/pluginManager';
import { IntegrationConfig, IntegrationType, PluginScanOptions } from '../../core/types';
import * as path from 'path';

/**
 * Webpack 插件配置
 */
export interface SecLinterWebpackPluginOptions {
  /** 是否在构建开始时执行扫描 */
  scanOnStart?: boolean;
  /** 是否在构建完成时执行扫描 */
  scanOnDone?: boolean;
  /** 是否在发现安全问题时中断构建 */
  failOnIssues?: boolean;
  /** 失败的最低严重程度 */
  failSeverity?: 'low' | 'medium' | 'high' | 'critical';
  /** 插件管理器配置 */
  pluginManager?: IntegrationConfig;
  /** 扫描选项 */
  scanOptions?: Partial<PluginScanOptions>;
}

/**
 * 默认 Webpack 插件配置
 */
const DEFAULT_OPTIONS: SecLinterWebpackPluginOptions = {
  scanOnStart: false,
  scanOnDone: true,
  failOnIssues: false,
  failSeverity: 'high',
  pluginManager: {
    type: IntegrationType.WEBPACK,
    autoDiscover: true
  },
  scanOptions: {
    parallel: true
  }
};

/**
 * SecLinter Webpack 插件
 */
export class SecLinterWebpackPlugin implements WebpackPluginInstance {
  private options: SecLinterWebpackPluginOptions;
  private pluginManager: any;
  private initialized: boolean = false;

  /**
   * 创建 SecLinter Webpack 插件
   * @param options 插件配置
   */
  constructor(options: SecLinterWebpackPluginOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 应用插件
   * @param compiler Webpack 编译器
   */
  apply(compiler: Compiler): void {
    const pluginName = 'SecLinterWebpackPlugin';

    // 初始化插件管理器
    const init = async () => {
      if (!this.initialized) {
        this.pluginManager = createPluginManager(this.options.pluginManager as any);
        await this.pluginManager.init();
        this.initialized = true;
      }
    };

    // 在构建开始时执行扫描
    if (this.options.scanOnStart) {
      compiler.hooks.beforeCompile.tapAsync(pluginName, async (params: any, callback: any) => {
        try {
          await init();
          await this.runScan(compiler);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      });
    }

    // 在构建完成时执行扫描
    if (this.options.scanOnDone) {
      compiler.hooks.afterEmit.tapAsync(pluginName, async (compilation: any, callback: any) => {
        try {
          await init();
          await this.runScan(compiler);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      });
    }
  }

  /**
   * 执行安全扫描
   * @param compiler Webpack 编译器
   */
  private async runScan(compiler: Compiler): Promise<void> {
    try {
      // 获取项目路径
      const projectPath = compiler.context || process.cwd();

      // 执行扫描
      const scanOptions: PluginScanOptions = {
        projectPath,
        ...this.options.scanOptions
      };

      const report = await this.pluginManager.scan(scanOptions);

      // 输出扫描结果
      this.logScanResults(compiler, report);

      // 检查是否需要中断构建
      if (this.options.failOnIssues && this.shouldFailBuild(report)) {
        const error = new Error(`SecLinter found security issues with severity >= ${this.options.failSeverity}`);
        throw error;
      }
    } catch (error) {
      compiler.hooks.compilation.tap('SecLinterWebpackPlugin', (compilation: any) => {
        compilation.errors.push(new Error(`SecLinter error: ${(error as Error).message}`));
      });
    }
  }

  /**
   * 输出扫描结果
   * @param compiler Webpack 编译器
   * @param report 扫描报告
   */
  private logScanResults(compiler: Compiler, report: any): void {
    const { logger } = compiler;
    const { results, stats } = report;

    logger.info(`[SecLinter] Scanned ${stats.pluginsScanned} plugins in ${stats.scanTime}ms`);
    logger.info(`[SecLinter] Found ${stats.issuesFound} security issues`);

    // 按严重程度输出统计信息
    // @ts-ignore
    Object.entries(stats.byLevel).forEach(([level, count]: [string, number]) => {
      if (count > 0) {
        const method = level === 'critical' || level === 'high' ? 'warn' : 'info';
        logger[method](`[SecLinter] ${count} ${level} issues`);
      }
    });

    // 输出失败的插件
    if (stats.failedPlugins.length > 0) {
      logger.warn(`[SecLinter] ${stats.failedPlugins.length} plugins failed to scan`);
    }

    // 输出高严重性问题的详细信息
    results
      .filter((result: any) => result.level === 'critical' || result.level === 'high')
      .forEach((result: any) => {
        logger.warn(
          `[SecLinter] ${result.level.toUpperCase()}: ${result.message} ` +
          `(${result.plugin}${result.file ? ` in ${result.file}` : ''})`
        );
      });
  }

  /**
   * 检查是否应该中断构建
   * @param report 扫描报告
   * @returns 是否应该中断构建
   */
  private shouldFailBuild(report: any): boolean {
    const { results } = report;
    const severityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const failLevel = severityLevels[this.options.failSeverity || 'high'];

    return results.some((result: any) => {
      // @ts-ignore
      return severityLevels[result.level] >= failLevel
    });
  }
}

export default SecLinterWebpackPlugin;
