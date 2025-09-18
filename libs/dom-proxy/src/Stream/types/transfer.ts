/**
 * 数据传输相关类型定义
 */

/**
 * 传输配置
 */
export interface TransferConfig {
  /** 请求超时时间(ms) */
  timeout?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟(ms) */
  retryDelay?: number;
  /** 最大并发数 */
  maxConcurrency?: number;
  /** 分块大小(bytes) */
  chunkSize?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * 进度信息
 */
export interface ProgressInfo {
  /** 已加载字节数 */
  loaded: number;
  /** 总字节数 */
  total: number;
  /** 完成百分比 */
  percentage: number;
  /** 传输速度(bytes/s) */
  speed?: number;
  /** 剩余时间(ms) */
  remainingTime?: number;
  /** 当前分块索引 */
  chunkIndex?: number;
  /** 总分块数 */
  totalChunks?: number;
}

/**
 * 进度回调函数
 */
export type ProgressCallback = (progress: ProgressInfo) => void;

/**
 * 分页传输选项
 */
export interface PaginatedTransferOptions {
  /** 每页大小 */
  pageSize: number;
  /** 是否并行传输 */
  parallel?: boolean;
  /** 最大连接数 */
  maxConnections?: number;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 进度回调 */
  onProgress?: ProgressCallback;
  /** 页面处理回调 */
  onPageComplete?: (pageIndex: number, data: any) => void;
}

/**
 * 流式传输选项
 */
export interface StreamTransferOptions {
  /** 分块大小 */
  chunkSize: number;
  /** 进度回调 */
  onProgress?: ProgressCallback;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否启用压缩 */
  enableCompression?: boolean;
  /** 信号控制器 */
  signal?: AbortSignal;
}

/**
 * 压缩传输选项
 */
export interface CompressedTransferOptions {
  /** 压缩算法 */
  compressAlgorithm: 'gzip' | 'brotli' | 'deflate';
  /** 压缩级别 */
  level?: number;
  /** 进度回调 */
  onProgress?: ProgressCallback;
  /** 请求头 */
  headers?: Record<string, string>;
}

/**
 * 断点续传选项
 */
export interface ResumableTransferOptions {
  /** 是否启用检查点 */
  checkPoint: boolean;
  /** 检查点存储键 */
  checkPointKey?: string;
  /** 中断回调 */
  onInterrupt?: () => void;
  /** 恢复回调 */
  onResume?: (resumePoint: number) => void;
  /** 进度回调 */
  onProgress?: ProgressCallback;
  /** 请求头 */
  headers?: Record<string, string>;
}

/**
 * 断点续传状态
 */
export interface ResumableState {
  /** 文件标识 */
  fileId: string;
  /** 已上传字节数 */
  uploadedBytes: number;
  /** 总字节数 */
  totalBytes: number;
  /** 分块信息 */
  chunks: ChunkInfo[];
  /** 创建时间 */
  createdAt: number;
  /** 最后更新时间 */
  updatedAt: number;
}

/**
 * 分块信息
 */
export interface ChunkInfo {
  /** 分块索引 */
  index: number;
  /** 起始位置 */
  start: number;
  /** 结束位置 */
  end: number;
  /** 分块大小 */
  size: number;
  /** 是否已上传 */
  uploaded: boolean;
  /** 上传时间 */
  uploadedAt?: number;
  /** 重试次数 */
  retryCount?: number;
}

/**
 * 传输结果
 */
export interface TransferResult<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误信息 */
  error?: Error;
  /** 传输统计 */
  stats: TransferStats;
}

/**
 * 传输统计
 */
export interface TransferStats {
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime: number;
  /** 总耗时(ms) */
  duration: number;
  /** 传输字节数 */
  bytesTransferred: number;
  /** 平均速度(bytes/s) */
  averageSpeed: number;
  /** 重试次数 */
  retryCount: number;
}