/**
 * 数据传输核心类
 * 提供大数据传输、压缩、断点续传等功能
 */

import type {
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
} from '../types/transfer';

import { BinaryData } from './BinaryData';
import { StreamOperations } from './StreamOperations';
import { getDefaultCompatibilityManager } from './CompatibilityManager';
import { TransferError, StreamError } from '../utils/errors';
import { createProgressTracker, formatBytes, calculateSpeed } from '../utils';

/**
 * 数据传输类
 */
export class DataTransfer {
  private config: Required<TransferConfig>;
  private abortController?: AbortController;

  constructor(config: TransferConfig = {}) {
    this.config = {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      maxConcurrency: 5,
      chunkSize: 1024 * 1024, // 1MB
      debug: false,
      ...config
    };
  }

  /**
   * 分页传输
   * @param url 目标URL
   * @param data 要传输的数据
   * @param options 分页选项
   */
  async paginatedTransfer<T = any>(
    url: string,
    data: BinaryData,
    options: PaginatedTransferOptions
  ): Promise<TransferResult<T[]>> {
    const startTime = Date.now();
    const stats: TransferStats = {
      startTime,
      endTime: 0,
      duration: 0,
      bytesTransferred: 0,
      averageSpeed: 0,
      retryCount: 0
    };

    try {
      const totalSize = data.size;
      const pageSize = options.pageSize;
      const totalPages = Math.ceil(totalSize / pageSize);
      const results: T[] = [];

      if (this.config.debug) {
        console.log(`[DataTransfer] Starting paginated transfer: ${totalPages} pages`);
      }

      // 创建进度跟踪器
      const progressTracker = createProgressTracker();

      if (options.parallel) {
        // 并行传输
        results.push(...await this.parallelPaginatedTransfer<T>(
          url, data, options, totalPages, progressTracker, stats
        ));
      } else {
        // 串行传输
        results.push(...await this.serialPaginatedTransfer<T>(
          url, data, options, totalPages, progressTracker, stats
        ));
      }

      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.averageSpeed = calculateSpeed(stats.bytesTransferred, stats.duration);

      return {
        success: true,
        data: results,
        stats
      };

    } catch (error) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;

      return {
        success: false,
        error: error as Error,
        stats
      };
    }
  }

  /**
   * 并行分页传输
   */
  private async parallelPaginatedTransfer<T>(
    url: string,
    data: BinaryData,
    options: PaginatedTransferOptions,
    totalPages: number,
    progressTracker: ReturnType<typeof createProgressTracker>,
    stats: TransferStats
  ): Promise<T[]> {
    const maxConnections = Math.min(
      options.maxConnections || this.config.maxConcurrency,
      totalPages
    );

    const results: T[] = new Array(totalPages);
    const semaphore = new Semaphore(maxConnections);

    const transferPromises = Array.from({ length: totalPages }, async (_, pageIndex) => {
      await semaphore.acquire();

      try {
        const result = await this.transferPage<T>(
          url, data, options, pageIndex, progressTracker, stats
        );
        results[pageIndex] = result;
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(transferPromises);
    return results;
  }

  /**
   * 串行分页传输
   */
  private async serialPaginatedTransfer<T>(
    url: string,
    data: BinaryData,
    options: PaginatedTransferOptions,
    totalPages: number,
    progressTracker: ReturnType<typeof createProgressTracker>,
    stats: TransferStats
  ): Promise<T[]> {
    const results: T[] = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const result = await this.transferPage<T>(
        url, data, options, pageIndex, progressTracker, stats
      );
      results.push(result);
    }

    return results;
  }

  /**
   * 传输单个页面
   */
  private async transferPage<T>(
    url: string,
    data: BinaryData,
    options: PaginatedTransferOptions,
    pageIndex: number,
    progressTracker: ReturnType<typeof createProgressTracker>,
    stats: TransferStats
  ): Promise<T> {
    const pageSize = options.pageSize;
    const start = pageIndex * pageSize;
    const end = Math.min(start + pageSize, data.size);
    const pageData = data.slice(start, end);

    const response = await this.performRequest(url, pageData, {
      headers: {
        ...options.headers,
        'X-Page-Index': pageIndex.toString(),
        'X-Page-Size': pageSize.toString()
      }
    });

    const result = await response.json();

    // 更新统计
    stats.bytesTransferred += pageData.size;

    // 更新进度
    const progress = progressTracker(stats.bytesTransferred, data.size);
    if (options.onProgress) {
      options.onProgress(progress);
    }

    // 页面完成回调
    if (options.onPageComplete) {
      options.onPageComplete(pageIndex, result);
    }

    return result;
  }

  /**
   * 流式传输
   * @param url 目标URL
   * @param data 要传输的数据
   * @param options 流式选项
   */
  async streamTransfer<T = any>(
    url: string,
    data: BinaryData,
    options: StreamTransferOptions
  ): Promise<TransferResult<T>> {
    const startTime = Date.now();
    const stats: TransferStats = {
      startTime,
      endTime: 0,
      duration: 0,
      bytesTransferred: 0,
      averageSpeed: 0,
      retryCount: 0
    };

    try {
      if (this.config.debug) {
        console.log(`[DataTransfer] Starting stream transfer: ${formatBytes(data.size)}`);
      }

      // 创建流
      const stream = StreamOperations.binaryToStream(data, options.chunkSize);

      // 创建进度跟踪器
      const progressTracker = createProgressTracker();

      // 执行流式上传
      const response = await this.performStreamRequest(
        url, stream, options, progressTracker, stats
      );

      const result = await response.json();

      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.averageSpeed = calculateSpeed(stats.bytesTransferred, stats.duration);

      return {
        success: true,
        data: result,
        stats
      };

    } catch (error) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;

      return {
        success: false,
        error: error as Error,
        stats
      };
    }
  }

  /**
   * 执行流式请求
   */
  private async performStreamRequest(
    url: string,
    stream: ReadableStream<Uint8Array>,
    options: StreamTransferOptions,
    progressTracker: ReturnType<typeof createProgressTracker>,
    stats: TransferStats
  ): Promise<Response> {
    // 创建进度监控转换流
    const progressTransform = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        stats.bytesTransferred += chunk.byteLength;

        if (options.onProgress) {
          const progress = progressTracker(stats.bytesTransferred, 0);
          options.onProgress(progress);
        }

        controller.enqueue(chunk);
      }
    });

    const monitoredStream = stream.pipeThrough(progressTransform);

    // 可选的压缩
    let finalStream = monitoredStream;
    if (options.enableCompression) {
      const compressionTransform = StreamOperations.createCompressionTransform('gzip');
      finalStream = finalStream.pipeThrough(compressionTransform);
    }

    return await this.performRequest(url, finalStream, {
      headers: {
        ...options.headers,
        'Content-Type': 'application/octet-stream',
        'Transfer-Encoding': 'chunked'
      },
      signal: options.signal
    });
  }

  /**
   * 压缩传输
   * @param url 目标URL
   * @param data 要传输的数据
   * @param options 压缩选项
   */
  async compressedTransfer<T = any>(
    url: string,
    data: BinaryData,
    options: CompressedTransferOptions
  ): Promise<TransferResult<T>> {
    const startTime = Date.now();
    const stats: TransferStats = {
      startTime,
      endTime: 0,
      duration: 0,
      bytesTransferred: 0,
      averageSpeed: 0,
      retryCount: 0
    };

    try {
      const compatibilityManager = getDefaultCompatibilityManager();

      if (!compatibilityManager.isSupported('compressionStreams')) {
        throw new StreamError(
          'Compression streams not supported in this environment',
          'COMPRESSION_NOT_SUPPORTED'
        );
      }

      if (this.config.debug) {
        console.log(`[DataTransfer] Starting compressed transfer with ${options.compressAlgorithm}`);
      }

      // 创建压缩流
      const sourceStream = StreamOperations.binaryToStream(data);
      const compressionTransform = StreamOperations.createCompressionTransform(
        options.compressAlgorithm as 'gzip' | 'deflate'
      );

      // 创建进度跟踪器
      const progressTracker = createProgressTracker();

      // 压缩数据
      const compressedStream = sourceStream.pipeThrough(compressionTransform);

      // 执行传输
      const response = await this.performStreamRequest(
        url, compressedStream, {
          chunkSize: this.config.chunkSize,
          headers: {
            ...options.headers,
            'Content-Encoding': options.compressAlgorithm,
            'Content-Type': 'application/octet-stream'
          },
          onProgress: options.onProgress
        }, progressTracker, stats
      );

      const result = await response.json();

      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.averageSpeed = calculateSpeed(stats.bytesTransferred, stats.duration);

      return {
        success: true,
        data: result,
        stats
      };

    } catch (error) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;

      return {
        success: false,
        error: error as Error,
        stats
      };
    }
  }

  /**
   * 断点续传
   * @param url 目标URL
   * @param data 要传输的数据
   * @param options 断点续传选项
   */
  async resumableTransfer<T = any>(
    url: string,
    data: BinaryData,
    options: ResumableTransferOptions
  ): Promise<TransferResult<T>> {
    const startTime = Date.now();
    const stats: TransferStats = {
      startTime,
      endTime: 0,
      duration: 0,
      bytesTransferred: 0,
      averageSpeed: 0,
      retryCount: 0
    };

    try {
      if (this.config.debug) {
        console.log(`[DataTransfer] Starting resumable transfer`);
      }

      // 获取或创建断点续传状态
      const resumableState = await this.getOrCreateResumableState(data, options);

      // 创建进度跟踪器
      const progressTracker = createProgressTracker();

      // 执行分块上传
      const result = await this.performResumableUpload<T>(
        url, data, resumableState, options, progressTracker, stats
      );

      // 清理断点续传状态
      if (options.checkPoint) {
        await this.clearResumableState(options.checkPointKey || 'default');
      }

      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.averageSpeed = calculateSpeed(stats.bytesTransferred, stats.duration);

      return {
        success: true,
        data: result,
        stats
      };

    } catch (error) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;

      // 保存断点续传状态
      if (options.checkPoint && options.onInterrupt) {
        options.onInterrupt();
      }

      return {
        success: false,
        error: error as Error,
        stats
      };
    }
  }

  /**
   * 获取或创建断点续传状态
   */
  private async getOrCreateResumableState(
    data: BinaryData,
    options: ResumableTransferOptions
  ): Promise<ResumableState> {
    const key = options.checkPointKey || 'default';

    // 尝试从存储中恢复状态
    const savedState = await this.loadResumableState(key);

    if (savedState && savedState.totalBytes === data.size) {
      if (options.onResume) {
        options.onResume(savedState.uploadedBytes);
      }
      return savedState;
    }

    // 创建新的状态
    const chunkSize = this.config.chunkSize;
    const totalChunks = Math.ceil(data.size / chunkSize);
    const chunks: ChunkInfo[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.size);

      chunks.push({
        index: i,
        start,
        end,
        size: end - start,
        uploaded: false
      });
    }

    const newState: ResumableState = {
      fileId: await this.generateFileId(data),
      uploadedBytes: 0,
      totalBytes: data.size,
      chunks,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.saveResumableState(key, newState);
    return newState;
  }

  /**
   * 执行断点续传上传
   */
  private async performResumableUpload<T>(
    url: string,
    data: BinaryData,
    state: ResumableState,
    options: ResumableTransferOptions,
    progressTracker: ReturnType<typeof createProgressTracker>,
    stats: TransferStats
  ): Promise<T> {
    const unuploadedChunks = state.chunks.filter(chunk => !chunk.uploaded);

    for (const chunk of unuploadedChunks) {
      const chunkData = data.slice(chunk.start, chunk.end);

      try {
        await this.uploadChunk(url, chunkData, chunk, options);

        // 更新状态
        chunk.uploaded = true;
        chunk.uploadedAt = Date.now();
        state.uploadedBytes += chunk.size;
        state.updatedAt = Date.now();

        // 保存状态
        if (options.checkPoint) {
          await this.saveResumableState(
            options.checkPointKey || 'default',
            state
          );
        }

        // 更新统计和进度
        stats.bytesTransferred += chunk.size;

        if (options.onProgress) {
          const progress = progressTracker(stats.bytesTransferred, data.size);
          options.onProgress(progress);
        }

      } catch (error) {
        chunk.retryCount = (chunk.retryCount || 0) + 1;

        if (chunk.retryCount >= this.config.retryCount) {
          throw error;
        }

        // 重试延迟
        await this.delay(this.config.retryDelay);
        stats.retryCount++;
      }
    }

    // 完成上传，获取最终结果
    return await this.finalizeResumableUpload<T>(url, state, options);
  }

  /**
   * 上传单个分块
   */
  private async uploadChunk(
    url: string,
    chunkData: BinaryData,
    chunk: ChunkInfo,
    options: ResumableTransferOptions
  ): Promise<void> {
    const response = await this.performRequest(url, chunkData, {
      headers: {
        ...options.headers,
        'Content-Range': `bytes ${chunk.start}-${chunk.end - 1}/${chunk.size}`,
        'X-Chunk-Index': chunk.index.toString()
      }
    });

    if (!response.ok) {
      throw new TransferError(
        `Chunk upload failed: ${response.statusText}`,
        url,
        response.status,
        'POST'
      );
    }
  }

  /**
   * 完成断点续传上传
   * @see
   */
  private async finalizeResumableUpload<T>(
    url: string,
    state: ResumableState,
    options: ResumableTransferOptions
  ): Promise<T> {
    const response = await this.performRequest(url, null, {
      method: 'POST',
      headers: {
        ...options.headers,
        'X-Upload-Complete': 'true',
        'X-File-Id': state.fileId
      }
    });

    if (!response.ok) {
      throw new TransferError(
        `Upload finalization failed: ${response.statusText}`,
        url,
        response.status,
        'POST'
      );
    }

    return await response.json();
  }

  /**
   * 执行HTTP请求
   */
  private async performRequest(
    url: string,
    body: BinaryData | ReadableStream | null,
    options: {
      method?: string;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      let requestBody: BodyInit | null = null;

      if (body instanceof BinaryData) {
        requestBody = body.toBlob();
      } else if (body instanceof ReadableStream) {
        requestBody = body as any; // ReadableStream is supported in modern browsers
      }

      const response = await fetch(url, {
        method: options.method || 'POST',
        headers: options.headers,
        body: requestBody,
        signal: options.signal || controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new TransferError(
          `HTTP ${response.status}: ${response.statusText}`,
          url,
          response.status,
          options.method || 'POST'
        );
      }

      return response;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TransferError('Request timeout', url);
      }

      throw error;
    }
  }

  // 工具方法
  private async generateFileId(data: BinaryData): Promise<string> {
    try {
      const hash = await data.computeHash('sha-256');
      return hash.substring(0, 16);
    } catch {
      return Math.random().toString(36).substring(2, 18);
    }
  }

  private async loadResumableState(key: string): Promise<ResumableState | null> {
    try {
      const stored = localStorage.getItem(`resumable_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private async saveResumableState(key: string, state: ResumableState): Promise<void> {
    try {
      localStorage.setItem(`resumable_${key}`, JSON.stringify(state));
    } catch {
      // 忽略存储错误
    }
  }

  private async clearResumableState(key: string): Promise<void> {
    try {
      localStorage.removeItem(`resumable_${key}`);
    } catch {
      // 忽略清理错误
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 中止当前传输
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

/**
 * 信号量类（用于控制并发）
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise<void>(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;

    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      this.permits--;
      resolve();
    }
  }
}