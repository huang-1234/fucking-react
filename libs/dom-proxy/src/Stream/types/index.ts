/**
 * Stream模块类型定义主入口
 */

import { BinaryDataInput } from './binary';
import { CompatibilityConfig } from './compatibility';
import { StreamOptions, StreamProcessor } from './stream';
import { TransferConfig } from './transfer';

// 二进制数据相关类型
export type {
  BinaryDataInput,
  TextEncoding,
  BinaryDataOptions,
  SliceOptions,
  ConcatOptions,
  Base64Options,
  TextConversionOptions
} from './binary';

// 数据传输相关类型
export type {
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
  TransferStats
} from './transfer';

// 流处理相关类型
export type {
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
  StreamProcessor
} from './stream';

// 兼容性相关类型
export type {
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
  EnvironmentInfo
} from './compatibility';

// 常用联合类型
export type SupportedDataTypes = BinaryDataInput;
export type StreamType = 'readable' | 'writable' | 'transform';
export type CompressionType = 'gzip' | 'brotli' | 'deflate';
export type TransferMode = 'stream' | 'chunk' | 'buffer';

// 配置相关类型
export interface StreamModuleConfig {
  /** 兼容性配置 */
  compatibility?: CompatibilityConfig;
  /** 传输配置 */
  transfer?: TransferConfig;
  /** 流配置 */
  stream?: StreamOptions;
  /** 是否启用调试模式 */
  debug?: boolean;
}

// 事件相关类型
export interface StreamEvent {
  /** 事件类型 */
  type: string;
  /** 事件数据 */
  data?: any;
  /** 时间戳 */
  timestamp: number;
  /** 事件源 */
  source?: string;
}

export type StreamEventListener = (event: StreamEvent) => void;

// 工厂函数类型
export type StreamFactory<T> = (options?: any) => T;
export type DataProcessorFactory<I, O> = (options?: any) => StreamProcessor<I, O>;

// 中间件类型
export interface StreamMiddleware<T> {
  /** 中间件名称 */
  name: string;
  /** 处理函数 */
  process: (data: T, next: (data: T) => void) => void;
  /** 优先级 */
  priority?: number;
}

// 插件接口
export interface StreamPlugin {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 初始化函数 */
  init: (config?: any) => void | Promise<void>;
  /** 销毁函数 */
  destroy?: () => void | Promise<void>;
}