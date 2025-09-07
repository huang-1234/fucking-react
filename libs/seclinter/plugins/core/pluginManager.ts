/**
 * SecLinter 插件管理器
 * 负责插件的发现、加载、初始化和生命周期管理
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  PluginInterface,
  PluginMeta,
  Sandbox,
  PluginHelpers,
  ScanResult,
  PluginStatus,
  PluginEventType,
  PluginEvent,
  PluginEventListener,
  PluginEventBus,
  PluginConfig
} from './pluginInterface';
import {
  PluginPackage,
  PluginManagerConfig,
  PluginScanOptions,
  PluginScanReport
} from './types';
import { createSandbox, runPluginInSandbox, SandboxOptions } from './sandbox';

/**
 * 默认插件管理器配置
 */
const DEFAULT_PLUGIN_MANAGER_CONFIG: PluginManagerConfig = {
  autoDiscover: true,
  pluginsDir: 'node_modules',
  enableSandbox: true,
  defaultPermissions: ['fs:read', 'net:outbound'],
  timeout: 10000,
  errorThreshold: 3
};

/**
 * 插件事件总线实现
 */
class EventBus implements PluginEventBus {
  private listeners: Map<PluginEventType, Set<PluginEventListener>> = new Map();

  /**
   * 发布事件
   * @param event 事件对象
   */
  emit(event: PluginEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      }
    }
  }

  /**
   * 订阅事件
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: PluginEventType, listener: PluginEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 取消订阅
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off(type: PluginEventType, listener: PluginEventListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }
}

/**
 * 插件管理器实现类
 */
export class PluginManager {
  private plugins: Map<string, PluginPackage> = new Map();
  private config: PluginManagerConfig;
  private helpers: PluginHelpers;
  private eventBus: EventBus = new EventBus();

  /**
   * 创建插件管理器
   * @param config 插件管理器配置
   * @param helpers 插件助手工具
   */
  constructor(
    config: Partial<PluginManagerConfig> = {},
    helpers?: Partial<PluginHelpers>
  ) {
    this.config = { ...DEFAULT_PLUGIN_MANAGER_CONFIG, ...config };

    // 创建默认的插件助手工具
    this.helpers = {
      logger: {
        info: (msg: string) => console.log(`[INFO] ${msg}`),
        warn: (msg: string) => console.warn(`[WARN] ${msg}`),
        error: (msg: string) => console.error(`[ERROR] ${msg}`),
        debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
      },
      httpClient: {
        get: async (url: string) => {
          const response = await fetch(url);
          return response.json();
        },
        post: async (url: string, data?: any) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return response.json();
        }
      },
      fs: {
        readFile: async (path: string) => fs.promises.readFile(path, 'utf-8'),
        writeFile: async (path: string, content: string) => fs.promises.writeFile(path, content, 'utf-8'),
        exists: async (path: string) => {
          try {
            await fs.promises.access(path);
            return true;
          } catch {
            return false;
          }
        }
      },
      path: {
        join: (...paths: string[]) => path.join(...paths),
        resolve: (...paths: string[]) => path.resolve(...paths),
        dirname: (p: string) => path.dirname(p),
        basename: (p: string) => path.basename(p)
      },
      ...helpers
    } as PluginHelpers;
  }

  /**
   * 初始化插件管理器
   */
  async init(): Promise<void> {
    if (this.config.autoDiscover) {
      await this.autoDiscoverPlugins();
    }

    // 加载配置中指定的插件
    if (this.config.plugins) {
      for (const [pluginName, pluginConfig] of Object.entries(this.config.plugins)) {
        if (pluginConfig === false) {
          // 禁用插件
          this.plugins.delete(pluginName);
        } else {
          try {
            const config: PluginConfig = typeof pluginConfig === 'boolean'
              ? { enabled: pluginConfig }
              : pluginConfig;

            if (config.enabled && !this.plugins.has(pluginName)) {
              // 尝试加载插件
              await this.loadPlugin(pluginName);
            }
          } catch (error) {
            this.helpers.logger.error(`Failed to load plugin ${pluginName}: ${(error as Error).message}`);
          }
        }
      }
    }
  }

  /**
   * 自动发现插件
   */
  async autoDiscoverPlugins(): Promise<void> {
    const pluginsDir = this.config.pluginsDir || 'node_modules';

    try {
      // 读取插件目录
      const dirs = await fs.promises.readdir(pluginsDir);

      // 查找符合命名规则的包
      const pluginPackages = dirs.filter(dir => dir.startsWith('seclinter-plugin-'));

      for (const pkgName of pluginPackages) {
        try {
          await this.loadPlugin(path.join(pluginsDir, pkgName));
        } catch (error) {
          this.helpers.logger.warn(`Failed to load plugin ${pkgName}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      this.helpers.logger.error(`Failed to auto-discover plugins: ${(error as Error).message}`);
    }
  }

  /**
   * 加载插件
   * @param pluginPath 插件路径
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // 解析插件路径
      const resolvedPath = path.isAbsolute(pluginPath)
        ? pluginPath
        : path.resolve(process.cwd(), pluginPath);

      // 检查插件是否存在
      const packageJsonPath = path.join(resolvedPath, 'package.json');
      if (!await this.helpers.fs.exists(packageJsonPath)) {
        throw new Error(`Plugin package.json not found at ${packageJsonPath}`);
      }

      // 读取插件元数据
      const packageJson = JSON.parse(await this.helpers.fs.readFile(packageJsonPath));
      const pluginName = packageJson.name;

      // 检查插件是否已加载
      if (this.plugins.has(pluginName)) {
        this.helpers.logger.warn(`Plugin ${pluginName} is already loaded`);
        return;
      }

      // 查找插件入口文件
      const entryFile = packageJson.main || 'index.js';
      const entryPath = path.join(resolvedPath, entryFile);

      if (!await this.helpers.fs.exists(entryPath)) {
        throw new Error(`Plugin entry file not found at ${entryPath}`);
      }

      // 加载插件
      let pluginInstance: PluginInterface;
      let pluginMeta: PluginMeta;

      if (this.config.enableSandbox) {
        // 在沙箱中加载插件
        const sandbox = createSandbox({
          permissions: this.config.defaultPermissions || [],
          timeout: this.config.timeout
        });

        const pluginModule = await runPluginInSandbox(entryPath, sandbox);
        pluginInstance = pluginModule.default;
        pluginMeta = pluginModule.meta;

        // 初始化插件
        await pluginInstance.init(sandbox, this.helpers);
      } else {
        // 直接加载插件
        const pluginModule = require(entryPath);
        pluginInstance = pluginModule.default;
        pluginMeta = pluginModule.meta;

        // 初始化插件
        await pluginInstance.init({} as Sandbox, this.helpers);
      }

      // 检查插件元数据
      if (!pluginMeta) {
        if (typeof pluginInstance.getMeta === 'function') {
          pluginMeta = pluginInstance.getMeta();
        } else {
          throw new Error(`Plugin ${pluginName} does not export meta information`);
        }
      }

      // 注册插件
      this.plugins.set(pluginName, {
        instance: pluginInstance,
        meta: pluginMeta,
        status: {
          name: pluginName,
          healthy: true,
          errorCount: 0
        },
        config: { enabled: true },
        path: resolvedPath
      });

      // 发布插件加载事件
      this.eventBus.emit({
        type: PluginEventType.LOADED,
        pluginName,
        data: pluginMeta,
        timestamp: Date.now()
      });

      this.helpers.logger.info(`Plugin ${pluginName} v${pluginMeta.version} loaded successfully`);
    } catch (error) {
      throw new Error(`Failed to load plugin ${pluginPath}: ${(error as Error).message}`);
    }
  }

  /**
   * 卸载插件
   * @param pluginName 插件名称
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.helpers.logger.warn(`Plugin ${pluginName} is not loaded`);
      return;
    }

    try {
      // 调用插件的清理方法
      if (typeof plugin.instance.cleanup === 'function') {
        await plugin.instance.cleanup();
      }

      // 移除插件
      this.plugins.delete(pluginName);

      // 发布插件卸载事件
      this.eventBus.emit({
        type: PluginEventType.UNLOADED,
        pluginName,
        timestamp: Date.now()
      });

      this.helpers.logger.info(`Plugin ${pluginName} unloaded successfully`);
    } catch (error) {
      this.helpers.logger.error(`Failed to unload plugin ${pluginName}: ${(error as Error).message}`);
    }
  }

  /**
   * 获取所有已加载的插件
   * @returns 插件列表
   */
  getPlugins(): PluginPackage[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取指定插件
   * @param pluginName 插件名称
   * @returns 插件包
   */
  getPlugin(pluginName: string): PluginPackage | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * 执行扫描
   * @param options 扫描选项
   * @returns 扫描报告
   */
  async scan(options: PluginScanOptions): Promise<PluginScanReport> {
    const startTime = Date.now();
    const results: ScanResult[] = [];
    const failedPlugins: string[] = [];
    const levelCounts: Record<string, number> = {
      info: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    const pluginCounts: Record<string, number> = {};

    // 过滤要扫描的插件
    let pluginsToScan = Array.from(this.plugins.values())
      .filter(plugin => plugin.config.enabled);

    if (options.targetPlugins && options.targetPlugins.length > 0) {
      pluginsToScan = pluginsToScan.filter(plugin =>
        options.targetPlugins!.includes(plugin.meta.name));
    }

    if (options.excludePlugins && options.excludePlugins.length > 0) {
      pluginsToScan = pluginsToScan.filter(plugin =>
        !options.excludePlugins!.includes(plugin.meta.name));
    }

    // 执行扫描
    if (options.parallel) {
      // 并行扫描
      const scanPromises = pluginsToScan.map(plugin =>
        this.scanWithPlugin(plugin, options.projectPath, options)
      );

      const scanResults = await Promise.allSettled(scanPromises);

      // 处理扫描结果
      scanResults.forEach((result, index) => {
        const plugin = pluginsToScan[index];

        if (result.status === 'fulfilled') {
          results.push(...result.value);

          // 更新统计信息
          result.value.forEach(item => {
            levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
            pluginCounts[plugin.meta.name] = (pluginCounts[plugin.meta.name] || 0) + 1;
          });
        } else {
          failedPlugins.push(plugin.meta.name);
          this.handlePluginError(plugin, result.reason);
        }
      });
    } else {
      // 串行扫描
      for (const plugin of pluginsToScan) {
        try {
          const pluginResults = await this.scanWithPlugin(plugin, options.projectPath, options);
          results.push(...pluginResults);

          // 更新统计信息
          pluginResults.forEach(item => {
            levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
            pluginCounts[plugin.meta.name] = (pluginCounts[plugin.meta.name] || 0) + 1;
          });
        } catch (error) {
          failedPlugins.push(plugin.meta.name);
          this.handlePluginError(plugin, error);
        }
      }
    }

    // 生成扫描报告
    const scanTime = Date.now() - startTime;

    return {
      results,
      stats: {
        pluginsScanned: pluginsToScan.length,
        issuesFound: results.length,
        byLevel: levelCounts,
        byPlugin: pluginCounts,
        scanTime,
        failedPlugins
      },
      timestamp: Date.now()
    };
  }

  /**
   * 使用指定插件执行扫描
   * @param plugin 插件包
   * @param projectPath 项目路径
   * @param options 扫描选项
   * @returns 扫描结果
   */
  private async scanWithPlugin(
    plugin: PluginPackage,
    projectPath: string,
    options: PluginScanOptions
  ): Promise<ScanResult[]> {
    const { instance, meta, status } = plugin;

    // 发布扫描开始事件
    this.eventBus.emit({
      type: PluginEventType.SCAN_STARTED,
      pluginName: meta.name,
      timestamp: Date.now()
    });

    try {
      // 设置超时
      const timeout = options.timeout || this.config.timeout || 10000;

      // 创建超时Promise
      const timeoutPromise = new Promise<ScanResult[]>((_, reject) => {
        setTimeout(() => reject(new Error(`Plugin scan timed out after ${timeout}ms`)), timeout);
      });

      // 创建扫描Promise
      const scanPromise = instance.scan(projectPath, options);

      // 使用Promise.race实现超时
      const results = await Promise.race([scanPromise, timeoutPromise]);

      // 发布扫描完成事件
      this.eventBus.emit({
        type: PluginEventType.SCAN_COMPLETED,
        pluginName: meta.name,
        data: { count: results.length },
        timestamp: Date.now()
      });

      // 重置错误计数
      status.errorCount = 0;

      return results;
    } catch (error) {
      // 发布扫描错误事件
      this.eventBus.emit({
        type: PluginEventType.SCAN_ERROR,
        pluginName: meta.name,
        data: { error },
        timestamp: Date.now()
      });

      throw error;
    }
  }

  /**
   * 处理插件错误
   * @param plugin 插件包
   * @param error 错误对象
   */
  private handlePluginError(plugin: PluginPackage, error: any): void {
    const { status } = plugin;

    // 更新插件状态
    status.errorCount++;
    status.lastError = error;

    // 记录错误日志
    this.helpers.logger.error(
      `Plugin ${plugin.meta.name} failed: ${error.message || error}`
    );

    // 检查错误阈值
    if (status.errorCount >= (this.config.errorThreshold || 3)) {
      status.healthy = false;

      this.helpers.logger.warn(
        `Plugin ${plugin.meta.name} is marked unhealthy due to repeated failures`
      );

      // 发布插件错误事件
      this.eventBus.emit({
        type: PluginEventType.ERROR,
        pluginName: plugin.meta.name,
        data: {
          error,
          errorCount: status.errorCount,
          healthy: false
        },
        timestamp: Date.now()
      });
    }
  }

  /**
   * 订阅插件事件
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: PluginEventType, listener: PluginEventListener): void {
    this.eventBus.on(type, listener);
  }

  /**
   * 取消订阅插件事件
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off(type: PluginEventType, listener: PluginEventListener): void {
    this.eventBus.off(type, listener);
  }
}

/**
 * 创建插件管理器
 * @param config 插件管理器配置
 * @param helpers 插件助手工具
 * @returns 插件管理器实例
 */
export function createPluginManager(
  config?: Partial<PluginManagerConfig>,
  helpers?: Partial<PluginHelpers>
): PluginManager {
  return new PluginManager(config, helpers);
}
