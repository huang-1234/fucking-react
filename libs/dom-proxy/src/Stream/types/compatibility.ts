/**
 * 兼容性相关类型定义
 */

/**
 * 特性支持检测结果
 */
export interface FeatureSupport {
  /** 基础Stream API支持 */
  streams: boolean;
  /** ReadableStream支持 */
  readableStream: boolean;
  /** WritableStream支持 */
  writableStream: boolean;
  /** TransformStream支持 */
  transformStream: boolean;
  /** 压缩流支持 */
  compressionStreams: boolean;
  /** TextEncoder支持 */
  textEncoder: boolean;
  /** TextDecoder支持 */
  textDecoder: boolean;
  /** WebSocket二进制支持 */
  webSocketBinary: boolean;
  /** ArrayBuffer.transfer支持 */
  arrayBufferTransfer: boolean;
  /** 异步迭代器支持 */
  asyncIterator: boolean;
  /** Blob构造函数支持 */
  blobConstructor: boolean;
  /** File API支持 */
  fileAPI: boolean;
  /** 结构化克隆支持 */
  structuredClone: boolean;
}

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  name: string;
  /** 浏览器版本 */
  version: string;
  /** 引擎名称 */
  engine: string;
  /** 引擎版本 */
  engineVersion: string;
  /** 是否为移动端 */
  mobile: boolean;
  /** 操作系统 */
  os: string;
}

/**
 * 降级策略类型
 */
export type FallbackStrategy = 
  | 'polyfill'
  | 'alternative'
  | 'disable'
  | 'error';

/**
 * 降级配置
 */
export interface FallbackConfig {
  /** 策略类型 */
  strategy: FallbackStrategy;
  /** polyfill URL */
  polyfillUrl?: string;
  /** 替代实现 */
  alternative?: () => any;
  /** 错误消息 */
  errorMessage?: string;
  /** 是否显示警告 */
  showWarning?: boolean;
}

/**
 * 兼容性配置
 */
export interface CompatibilityConfig {
  /** 是否自动加载polyfill */
  autoLoadPolyfills?: boolean;
  /** polyfill CDN基础URL */
  polyfillCDN?: string;
  /** 特性降级配置 */
  fallbacks?: Record<string, FallbackConfig>;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 最小支持版本 */
  minVersions?: Record<string, string>;
  /** 兼容性级别 */
  compatibilityLevel?: 'strict' | 'loose' | 'permissive';
}

/**
 * polyfill信息
 */
export interface PolyfillInfo {
  /** polyfill名称 */
  name: string;
  /** 版本 */
  version: string;
  /** CDN URL */
  url: string;
  /** 依赖项 */
  dependencies?: string[];
  /** 检测函数 */
  detect: () => boolean;
  /** 加载状态 */
  loaded?: boolean;
}

/**
 * 特性检测函数类型
 */
export type FeatureDetector = () => boolean;

/**
 * 特性检测配置
 */
export interface FeatureDetectionConfig {
  /** 检测函数映射 */
  detectors: Record<keyof FeatureSupport, FeatureDetector>;
  /** 是否缓存结果 */
  cache?: boolean;
  /** 缓存过期时间(ms) */
  cacheExpiry?: number;
}

/**
 * 兼容性检查结果
 */
export interface CompatibilityCheckResult {
  /** 是否兼容 */
  compatible: boolean;
  /** 支持的特性 */
  supportedFeatures: (keyof FeatureSupport)[];
  /** 不支持的特性 */
  unsupportedFeatures: (keyof FeatureSupport)[];
  /** 需要的polyfill */
  requiredPolyfills: string[];
  /** 警告信息 */
  warnings: string[];
  /** 浏览器信息 */
  browserInfo: BrowserInfo;
}

/**
 * polyfill加载状态
 */
export interface PolyfillLoadState {
  /** 加载状态 */
  status: 'pending' | 'loading' | 'loaded' | 'error';
  /** 错误信息 */
  error?: Error;
  /** 加载开始时间 */
  startTime?: number;
  /** 加载完成时间 */
  endTime?: number;
}

/**
 * 环境检测结果
 */
export interface EnvironmentInfo {
  /** 是否为浏览器环境 */
  isBrowser: boolean;
  /** 是否为Node.js环境 */
  isNode: boolean;
  /** 是否为Web Worker环境 */
  isWebWorker: boolean;
  /** 是否为Service Worker环境 */
  isServiceWorker: boolean;
  /** 是否支持ES模块 */
  supportsESModules: boolean;
  /** 是否支持动态导入 */
  supportsDynamicImport: boolean;
}