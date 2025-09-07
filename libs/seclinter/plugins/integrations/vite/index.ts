/**
 * SecLinter Vite 插件集成
 */
import { Plugin, ResolvedConfig } from 'vite';
import { createPluginManager } from '../../core/pluginManager';
import { IntegrationConfig, IntegrationType, PluginScanOptions } from '../../core/types';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Vite 插件配置
 */
export interface SecLinterVitePluginOptions {
  /** 是否在构建开始时执行扫描 */
  scanOnStart?: boolean;
  /** 是否在构建完成时执行扫描 */
  scanOnDone?: boolean;
  /** 是否在开发服务器启动时执行扫描 */
  scanOnDevServer?: boolean;
  /** 是否在发现安全问题时中断构建 */
  failOnIssues?: boolean;
  /** 失败的最低严重程度 */
  failSeverity?: 'low' | 'medium' | 'high' | 'critical';
  /** 插件管理器配置 */
  pluginManager?: IntegrationConfig;
  /** 扫描选项 */
  scanOptions?: Partial<PluginScanOptions>;
  /** 是否将扫描结果写入文件 */
  writeReport?: boolean;
  /** 报告文件路径 */
  reportPath?: string;
}

/**
 * 默认 Vite 插件配置
 */
const DEFAULT_OPTIONS: SecLinterVitePluginOptions = {
  scanOnStart: false,
  scanOnDone: true,
  scanOnDevServer: true,
  failOnIssues: false,
  failSeverity: 'high',
  pluginManager: {
    type: IntegrationType.VITE,
    autoDiscover: true
  },
  scanOptions: {
    parallel: true
  },
  writeReport: true,
  reportPath: 'seclinter-report.json'
};

/**
 * SecLinter Vite 插件
 * @param options 插件配置
 * @returns Vite 插件
 */
export function secLinterVitePlugin(options: SecLinterVitePluginOptions = {}): Plugin {
  const resolvedOptions: SecLinterVitePluginOptions = { ...DEFAULT_OPTIONS, ...options };
  let pluginManager: any;
  let config: ResolvedConfig;
  let initialized = false;

  /**
   * 初始化插件管理器
   */
  const init = async () => {
    if (!initialized) {
      pluginManager = createPluginManager(resolvedOptions.pluginManager);
      await pluginManager.init();
      initialized = true;
    }
  };

  /**
   * 执行安全扫描
   */
  const runScan = async (): Promise<any> => {
    try {
      // 获取项目路径
      const projectPath = config.root || process.cwd();

      // 执行扫描
      const scanOptions: PluginScanOptions = {
        projectPath,
        ...resolvedOptions.scanOptions
      };

      const report = await pluginManager.scan(scanOptions);

      // 输出扫描结果
      logScanResults(report);

      // 写入报告文件
      if (resolvedOptions.writeReport) {
        await writeReport(report);
      }

      // 检查是否需要中断构建
      if (resolvedOptions.failOnIssues && shouldFailBuild(report)) {
        throw new Error(`SecLinter found security issues with severity >= ${resolvedOptions.failSeverity}`);
      }

      return report;
    } catch (error) {
      config.logger.error(`SecLinter error: ${(error as Error).message}`);
      throw error;
    }
  };

  /**
   * 输出扫描结果
   * @param report 扫描报告
   */
  const logScanResults = (report: any): void => {
    const { results, stats } = report;

    config.logger.info(`[SecLinter] Scanned ${stats.pluginsScanned} plugins in ${stats.scanTime}ms`);
    config.logger.info(`[SecLinter] Found ${stats.issuesFound} security issues`);

    // 按严重程度输出统计信息
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      if (count > 0) {
        const method = level === 'critical' || level === 'high' ? 'warn' : 'info';
        config.logger[method](`[SecLinter] ${count} ${level} issues`);
      }
    });

    // 输出失败的插件
    if (stats.failedPlugins.length > 0) {
      config.logger.warn(`[SecLinter] ${stats.failedPlugins.length} plugins failed to scan`);
    }

    // 输出高严重性问题的详细信息
    results
      .filter(result => result.level === 'critical' || result.level === 'high')
      .forEach(result => {
        config.logger.warn(
          `[SecLinter] ${result.level.toUpperCase()}: ${result.message} ` +
          `(${result.plugin}${result.file ? ` in ${result.file}` : ''})`
        );
      });
  };

  /**
   * 写入报告文件
   * @param report 扫描报告
   */
  const writeReport = async (report: any): Promise<void> => {
    try {
      const reportPath = path.resolve(config.root, resolvedOptions.reportPath || 'seclinter-report.json');
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
      config.logger.info(`[SecLinter] Report written to ${reportPath}`);
    } catch (error) {
      config.logger.error(`[SecLinter] Failed to write report: ${(error as Error).message}`);
    }
  };

  /**
   * 检查是否应该中断构建
   * @param report 扫描报告
   * @returns 是否应该中断构建
   */
  const shouldFailBuild = (report: any): boolean => {
    const { results } = report;
    const severityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const failLevel = severityLevels[resolvedOptions.failSeverity || 'high'];

    return results.some(result =>
      severityLevels[result.level] >= failLevel
    );
  };

  return {
    name: 'vite-plugin-seclinter',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      if (resolvedOptions.scanOnStart) {
        await init();
        await runScan();
      }
    },

    async buildEnd() {
      if (resolvedOptions.scanOnDone) {
        await init();
        await runScan();
      }
    },

    async configureServer(server) {
      if (resolvedOptions.scanOnDevServer) {
        server.httpServer?.once('listening', async () => {
          await init();
          await runScan();
        });
      }
    }
  };
}

export default secLinterVitePlugin;
