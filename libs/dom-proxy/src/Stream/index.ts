/**
 * Web流式API封装库主入口
 *
 * 提供统一的二进制数据处理、大数据传输和流处理API
 * 支持浏览器兼容性处理和性能优化
 *
 * @author Stream API Team
 * @version 1.0.0
 */

import { CompatibilityManager, getDefaultCompatibilityManager } from './core/CompatibilityManager';
import { BinaryDataInput, StreamModuleConfig } from './types';

// 核心类导出
export { BinaryData } from './core/BinaryData';
export { DataTransfer } from './core/DataTransfer';
export { StreamOperations } from './core/StreamOperations';
export {
  CompatibilityManager,
  createCompatibilityManager,
  getDefaultCompatibilityManager
} from './core/CompatibilityManager';

// 类型定义导出
export type {
  // 二进制数据类型
  BinaryDataInput,
  TextEncoding,
  BinaryDataOptions,
  SliceOptions,
  ConcatOptions,
  Base64Options,
  TextConversionOptions,

  // 传输相关类型
  TransferConfig,
  ProgressInfo,
  ProgressCallback,
  PaginatedTransferOptions,
  StreamTransferOptions,
  CompressedTransferOptions,
  ResumableTransferOptions,
  ResumableState,
  ChunkInfo,
  TransferResult,
  TransferStats,

  // 流处理类型
  ReadableStreamSource,
  WritableStreamSink,
  StreamTransformer,
  StreamOptions,
  QueuingStrategy,
  PipeOptions,
  StreamReaderOptions,
  StreamWriterOptions,
  StreamState,
  StreamStats,
  StreamConversionOptions,
  ByteStreamReaderOptions,
  StreamProcessor,

  // 兼容性类型
  FeatureSupport,
  BrowserInfo,
  FallbackStrategy,
  FallbackConfig,
  CompatibilityConfig,
  PolyfillInfo,
  FeatureDetector,
  FeatureDetectionConfig,
  CompatibilityCheckResult,
  PolyfillLoadState,
  EnvironmentInfo,

  // 通用类型
  SupportedDataTypes,
  StreamType,
  CompressionType,
  TransferMode,
  StreamModuleConfig,
  StreamEvent,
  StreamEventListener,
  StreamFactory,
  DataProcessorFactory,
  StreamMiddleware,
  StreamPlugin
} from './types';

// 错误类导出
export {
  StreamError,
  CompatibilityError,
  TransferError,
  DataFormatError,
  MemoryError,
  ErrorHandler
} from './utils/errors';

// 集成功能导出
export {
  // Tracking集成
  DataTransferTracker,
  DataTransferAnalytics,
  getGlobalDataTransferTracker,
  setGlobalDataTransferTracker,
  createTransferId,

  // UniversalModule集成
  StreamUniversalAdapter,
  StreamModuleFactory,
  createStreamUniversalConfig,
  registerStreamModule,
  STREAM_LAZY_LOAD_CONFIG,

  // LazyLoader集成
  StreamLazyLoader,
  StreamResourceOptimizer,
  getGlobalStreamLazyLoader,
  setGlobalStreamLazyLoader,
  createStreamLazyLoaderConfig,

  // 一键集成
  integrateStreamModule,
  getIntegrationStatus,
  resetAllIntegrations
} from './integrations';

export type {
  DataTransferTrackingEvent,
  StreamUniversalConfig,
  StreamLazyConfig
} from './integrations';

// 工具函数导出
export {
  detectFeatures,
  detectFeature,
  getBrowserInfo,
  getEnvironmentInfo,
  checkMinVersion,
  generateCompatibilityReport,
  featureCache,
  featureDetectors,
  PolyfillLoader,
  createPolyfillLoader,
  conditionalLoadPolyfill,
  getGlobalPolyfillLoader,
  setGlobalPolyfillLoader,
  BUILTIN_POLYFILLS,
  formatBytes,
  calculateSpeed,
  estimateRemainingTime,
  createProgressTracker,
  isArrayBufferView,
  isTypedArray,
  concatArrayBuffers,
  sliceArrayBuffer,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  stringToArrayBuffer,
  arrayBufferToString
} from './utils';

// 常量定义
export const STREAM_CONSTANTS = {
  /** 默认分块大小 (1MB) */
  DEFAULT_CHUNK_SIZE: 1024 * 1024,
  /** 默认超时时间 (30秒) */
  DEFAULT_TIMEOUT: 30000,
  /** 默认重试次数 */
  DEFAULT_RETRY_COUNT: 3,
  /** 默认重试延迟 (1秒) */
  DEFAULT_RETRY_DELAY: 1000,
  /** 最大并发数 */
  MAX_CONCURRENCY: 10,
  /** 支持的压缩算法 */
  SUPPORTED_COMPRESSION: ['gzip', 'brotli', 'deflate'] as const,
  /** 支持的文本编码 */
  SUPPORTED_ENCODINGS: ['utf-8', 'utf-16', 'latin1', 'ascii'] as const
} as const;

// 版本信息
export const VERSION = '1.0.0';

// 默认配置
export const DEFAULT_CONFIG: StreamModuleConfig = {
  compatibility: {
    autoLoadPolyfills: true,
    debug: false
  },
  transfer: {
    timeout: STREAM_CONSTANTS.DEFAULT_TIMEOUT,
    retryCount: STREAM_CONSTANTS.DEFAULT_RETRY_COUNT,
    retryDelay: STREAM_CONSTANTS.DEFAULT_RETRY_DELAY,
    maxConcurrency: 5,
    chunkSize: STREAM_CONSTANTS.DEFAULT_CHUNK_SIZE,
    debug: false
  },
  stream: {
    highWaterMark: 16384,
    enableBackpressure: true
  },
  debug: false
};

// 模块初始化状态
let isInitialized = false;
let moduleConfig: StreamModuleConfig = { ...DEFAULT_CONFIG };

/**
 * 初始化Stream模块
 * @param config 配置选项
 */
export async function initStreamModule(config?: Partial<StreamModuleConfig>): Promise<void> {
  if (isInitialized) {
    console.warn('[StreamModule] 模块已经初始化，跳过重复初始化');
    return;
  }

  // 合并配置
  moduleConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    compatibility: {
      ...DEFAULT_CONFIG.compatibility,
      ...config?.compatibility
    },
    transfer: {
      ...DEFAULT_CONFIG.transfer,
      ...config?.transfer
    },
    stream: {
      ...DEFAULT_CONFIG.stream,
      ...config?.stream
    }
  };

  try {
    // 初始化兼容性管理器
    const compatibilityManager = CompatibilityManager.getInstance();
    await compatibilityManager.initialize(moduleConfig.compatibility);

    isInitialized = true;

    if (moduleConfig.debug) {
      console.log('[StreamModule] 初始化成功', {
        version: VERSION,
        config: moduleConfig,
        compatibility: compatibilityManager.generateReport()
      });
    }
  } catch (error) {
    console.error('[StreamModule] 初始化失败:', error);
    throw error;
  }
}

/**
 * 获取模块配置
 */
export function getModuleConfig(): StreamModuleConfig {
  return { ...moduleConfig };
}

/**
 * 检查模块是否已初始化
 */
export function isModuleInitialized(): boolean {
  return isInitialized;
}

/**
 * 重置模块状态（主要用于测试）
 */
export function resetModule(): void {
  isInitialized = false;
  moduleConfig = { ...DEFAULT_CONFIG };

  // 重置兼容性管理器
  const compatibilityManager = getDefaultCompatibilityManager();
  compatibilityManager.reset();
}

// 便捷的类型守卫函数
export function isBinaryDataInput(value: any): value is BinaryDataInput {
  return value instanceof ArrayBuffer ||
         value instanceof Blob ||
         value instanceof Uint8Array ||
         value instanceof Uint16Array ||
         value instanceof Uint32Array ||
         value instanceof Int8Array ||
         value instanceof Int16Array ||
         value instanceof Int32Array ||
         value instanceof Float32Array ||
         value instanceof Float64Array ||
         typeof value === 'string';
}

export function isReadableStream(value: any): value is ReadableStream {
  return value && typeof value.getReader === 'function';
}

export function isWritableStream(value: any): value is WritableStream {
  return value && typeof value.getWriter === 'function';
}
export function isObjectLike(value: any): value is object {
  return value !== null && typeof value === 'object';
}

export function isTransformStream(value: any): value is TransformStream {
  return value && isObjectLike(value.readable) && isObjectLike(value.writable)
}