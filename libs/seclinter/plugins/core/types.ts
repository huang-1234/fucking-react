/**
 * SecLinter 插件系统类型定义
 */
import { PluginInterface, PluginMeta, ScanResult, PluginStatus, PluginConfig } from './pluginInterface';

/**
 * 插件包信息
 */
export interface PluginPackage {
  /** 插件实例 */
  instance: PluginInterface;
  /** 插件元数据 */
  meta: PluginMeta;
  /** 插件状态 */
  status: PluginStatus;
  /** 插件配置 */
  config: PluginConfig;
  /** 插件路径 */
  path: string;
}

/**
 * 插件管理器配置
 */
export interface PluginManagerConfig {
  /** 是否自动发现插件 */
  autoDiscover?: boolean;
  /** 插件目录 */
  pluginsDir?: string;
  /** 插件配置 */
  plugins?: Record<string, boolean | PluginConfig>;
  /** 是否启用沙箱 */
  enableSandbox?: boolean;
  /** 默认插件权限 */
  defaultPermissions?: string[];
  /** 插件超时时间（毫秒） */
  timeout?: number;
  /** 错误阈值，超过后禁用插件 */
  errorThreshold?: number;
}

/**
 * 插件扫描选项
 */
export interface PluginScanOptions {
  /** 项目路径 */
  projectPath: string;
  /** 目标插件 */
  targetPlugins?: string[];
  /** 排除的插件 */
  excludePlugins?: string[];
  /** 是否并行执行 */
  parallel?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 自定义选项 */
  [key: string]: any;
}

/**
 * 插件扫描结果
 */
export interface PluginScanReport {
  /** 扫描结果 */
  results: ScanResult[];
  /** 扫描统计 */
  stats: {
    /** 扫描的插件数量 */
    pluginsScanned: number;
    /** 发现的问题数量 */
    issuesFound: number;
    /** 按严重程度统计 */
    byLevel: Record<string, number>;
    /** 按插件统计 */
    byPlugin: Record<string, number>;
    /** 扫描时间（毫秒） */
    scanTime: number;
    /** 失败的插件 */
    failedPlugins: string[];
  };
  /** 扫描时间 */
  timestamp: number;
}

/**
 * 集成平台类型
 */
export enum IntegrationType {
  WEBPACK = 'webpack',
  VITE = 'vite',
  BROWSER = 'browser',
  VSCODE = 'vscode',
  CLI = 'cli',
  NODE = 'node'
}

/**
 * 集成配置接口
 */
export interface IntegrationConfig {
  /** 集成类型 */
  type: IntegrationType;
  /** 插件管理器配置 */
  pluginManager?: PluginManagerConfig;
  /** 自定义配置 */
  [key: string]: any;
}

/**
 * 集成接口
 */
export interface Integration {
  /** 初始化集成 */
  init(config: IntegrationConfig): Promise<void>;
  /** 运行集成 */
  run(options?: any): Promise<any>;
  /** 销毁集成 */
  destroy(): Promise<void>;
}
