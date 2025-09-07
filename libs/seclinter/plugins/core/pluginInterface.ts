/**
 * SecLinter 插件系统核心接口定义
 * 定义了插件必须实现的接口和类型
 */

/**
 * 插件元数据
 */
export interface PluginMeta {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件作者 */
  author?: string;
  /** 插件描述 */
  description: string;
  /** 该插件针对的扫描类型，如 'dependency', 'secret', 'header', 'xss' 等 */
  target: string;
  /** 插件标签，用于分类和筛选 */
  tags?: string[];
  /** 插件所需权限 */
  permissions?: PluginPermission[];
}

/**
 * 插件权限类型
 */
export type PluginPermission =
  | 'fs:read'        // 文件系统读取权限
  | 'fs:write'       // 文件系统写入权限
  | 'net:outbound'   // 网络请求权限
  | 'process:exec'   // 执行外部命令权限
  | 'env:read';      // 读取环境变量权限

/**
 * 沙箱环境接口
 */
export interface Sandbox {
  /** 安全地执行代码 */
  run<T>(code: string): T;
  /** 获取沙箱内可用的API */
  getApi(): Record<string, any>;
}

/**
 * 插件助手工具接口
 */
export interface PluginHelpers {
  /** 日志记录器 */
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    debug: (msg: string) => void;
  };
  /** 安全的HTTP客户端 */
  httpClient: {
    get: (url: string, options?: any) => Promise<any>;
    post: (url: string, data?: any, options?: any) => Promise<any>;
  };
  /** 文件系统操作 */
  fs: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
  };
  /** 路径操作 */
  path: {
    join: (...paths: string[]) => string;
    resolve: (...paths: string[]) => string;
    dirname: (path: string) => string;
    basename: (path: string) => string;
  };
}

/**
 * 扫描结果接口
 */
export interface ScanResult {
  /** 规则唯一标识 */
  ruleId: string;
  /** 插件名称 */
  plugin: string;
  /** 严重程度 */
  level: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** 问题所在文件 */
  file?: string;
  /** 问题行号 */
  line?: number;
  /** 问题列号 */
  column?: number;
  /** 描述信息 */
  message: string;
  /** 修复建议 */
  suggestion?: string;
  /** 修复代码 */
  fix?: string;
  /** 相关链接 */
  links?: string[];
  /** 自定义数据 */
  metadata?: Record<string, any>;
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 自定义配置 */
  options?: Record<string, any>;
}

/**
 * 插件必须实现的核心接口
 */
export interface PluginInterface {
  /**
   * 初始化插件，内核会注入安全沙箱和工具函数
   * @param sandbox 沙箱环境
   * @param helpers 插件助手工具
   */
  init(sandbox: Sandbox, helpers?: PluginHelpers): Promise<void>;

  /**
   * 执行扫描的主要逻辑，返回扫描结果
   * @param projectPath 项目路径
   * @param options 扫描选项
   */
  scan(projectPath: string, options?: Record<string, any>): Promise<ScanResult[]>;

  /**
   * （可选）清理资源
   */
  cleanup?(): Promise<void>;

  /**
   * （可选）获取插件元数据
   */
  getMeta?(): PluginMeta;

  /**
   * （可选）获取插件配置架构
   */
  getConfigSchema?(): Record<string, any>;
}

/**
 * 插件状态接口
 */
export interface PluginStatus {
  /** 插件名称 */
  name: string;
  /** 插件是否健康 */
  healthy: boolean;
  /** 错误计数 */
  errorCount: number;
  /** 最后一次错误 */
  lastError?: Error;
  /** 最后一次执行时间 */
  lastExecutionTime?: number;
  /** 平均执行时间 */
  averageExecutionTime?: number;
}

/**
 * 插件事件类型
 */
export enum PluginEventType {
  LOADED = 'plugin:loaded',
  INITIALIZED = 'plugin:initialized',
  SCAN_STARTED = 'plugin:scan:started',
  SCAN_COMPLETED = 'plugin:scan:completed',
  SCAN_ERROR = 'plugin:scan:error',
  UNLOADED = 'plugin:unloaded',
  ERROR = 'plugin:error'
}

/**
 * 插件事件接口
 */
export interface PluginEvent {
  /** 事件类型 */
  type: PluginEventType;
  /** 插件名称 */
  pluginName: string;
  /** 事件数据 */
  data?: any;
  /** 事件时间戳 */
  timestamp: number;
}

/**
 * 插件事件监听器
 */
export type PluginEventListener = (event: PluginEvent) => void;

/**
 * 插件事件总线接口
 */
export interface PluginEventBus {
  /** 发布事件 */
  emit(event: PluginEvent): void;
  /** 订阅事件 */
  on(type: PluginEventType, listener: PluginEventListener): void;
  /** 取消订阅 */
  off(type: PluginEventType, listener: PluginEventListener): void;
}
