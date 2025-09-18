/**
 * 流处理相关类型定义
 */

/**
 * 可读流源
 */
export interface ReadableStreamSource<T> {
  /** 启动回调 */
  start?: (controller: ReadableStreamDefaultController<T>) => void | Promise<void>;
  /** 拉取回调 */
  pull?: (controller: ReadableStreamDefaultController<T>) => void | Promise<void>;
  /** 取消回调 */
  cancel?: (reason?: any) => void | Promise<void>;
  /** 类型标识 */
  type?: undefined;
}

/**
 * 可写流接收器
 */
export interface WritableStreamSink<T> {
  /** 启动回调 */
  start?: (controller: WritableStreamDefaultController) => void | Promise<void>;
  /** 写入回调 */
  write?: (chunk: T, controller: WritableStreamDefaultController) => void | Promise<void>;
  /** 关闭回调 */
  close?: () => void | Promise<void>;
  /** 中止回调 */
  abort?: (reason?: any) => void | Promise<void>;
}

/**
 * 转换流变换器
 */
export interface StreamTransformer<I, O> {
  /** 启动回调 */
  start?: (controller: TransformStreamDefaultController<O>) => void | Promise<void>;
  /** 转换回调 */
  transform?: (chunk: I, controller: TransformStreamDefaultController<O>) => void | Promise<void>;
  /** 刷新回调 */
  flush?: (controller: TransformStreamDefaultController<O>) => void | Promise<void>;
}

/**
 * 流配置选项
 */
export interface StreamOptions {
  /** 高水位标记 */
  highWaterMark?: number;
  /** 队列策略 */
  strategy?: QueuingStrategy<any>;
  /** 是否启用背压控制 */
  enableBackpressure?: boolean;
  /** 信号控制器 */
  signal?: AbortSignal;
}

/**
 * 队列策略
 */
export interface QueuingStrategy<T> {
  /** 高水位标记 */
  highWaterMark?: number;
  /** 大小计算函数 */
  size?: (chunk: T) => number;
}

/**
 * 流管道选项
 */
export interface PipeOptions {
  /** 是否阻止关闭 */
  preventClose?: boolean;
  /** 是否阻止中止 */
  preventAbort?: boolean;
  /** 是否阻止取消 */
  preventCancel?: boolean;
  /** 信号控制器 */
  signal?: AbortSignal;
}

/**
 * 流读取器选项
 */
export interface StreamReaderOptions {
  /** 读取模式 */
  mode?: 'byob';
  /** 缓冲区大小 */
  bufferSize?: number;
}

/**
 * 流写入器选项
 */
export interface StreamWriterOptions {
  /** 写入模式 */
  mode?: 'default';
  /** 缓冲区大小 */
  bufferSize?: number;
}

/**
 * 流状态
 */
export type StreamState = 'readable' | 'closed' | 'errored';

/**
 * 流统计信息
 */
export interface StreamStats {
  /** 已读取字节数 */
  bytesRead: number;
  /** 已写入字节数 */
  bytesWritten: number;
  /** 处理的块数 */
  chunksProcessed: number;
  /** 开始时间 */
  startTime: number;
  /** 当前状态 */
  state: StreamState;
  /** 错误信息 */
  error?: Error;
}

/**
 * 流转换选项
 */
export interface StreamConversionOptions {
  /** 分块大小 */
  chunkSize?: number;
  /** 编码格式 */
  encoding?: string;
  /** 是否保持顺序 */
  preserveOrder?: boolean;
  /** 进度回调 */
  onProgress?: (progress: { processed: number; total?: number }) => void;
}

/**
 * 字节流读取器选项
 */
export interface ByteStreamReaderOptions {
  /** 自带缓冲区模式 */
  mode: 'byob';
  /** 缓冲区 */
  buffer?: ArrayBufferView;
}

/**
 * 流处理器接口
 */
export interface StreamProcessor<I, O> {
  /** 处理单个块 */
  processChunk(chunk: I): O | Promise<O>;
  /** 处理完成回调 */
  onComplete?(): void | Promise<void>;
  /** 错误处理回调 */
  onError?(error: Error): void | Promise<void>;
}