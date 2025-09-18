/**
 * 流处理操作核心类
 * 提供完整的Stream API封装，支持流创建、转换、连接等操作
 */

import type {
  ReadableStreamSource,
  WritableStreamSink,
  StreamTransformer,
  StreamOptions,
  QueuingStrategy,
  PipeOptions,
  StreamReaderOptions,
  StreamWriterOptions,
  StreamStats,
  StreamConversionOptions,
  StreamProcessor
} from '../types/stream';

import { BinaryData } from './BinaryData';
import { getDefaultCompatibilityManager } from './CompatibilityManager';
import { StreamError, MemoryError } from '../utils/errors';

/**
 * 流操作类
 */
export class StreamOperations {
  private static readonly DEFAULT_CHUNK_SIZE = 64 * 1024; // 64KB
  private static readonly DEFAULT_HIGH_WATER_MARK = 16384;

  /**
   * 创建可读流
   * @param source 流源
   * @param options 选项
   */
  static createReadableStream<T>(
    source: ReadableStreamSource<T>,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('readableStream')) {
      throw new StreamError(
        'ReadableStream not supported in this environment',
        'READABLE_STREAM_NOT_SUPPORTED'
      );
    }

    try {
      const strategy = this.createQueuingStrategy<T>(options);
      
      return new ReadableStream<T>(source, strategy);
    } catch (error) {
      throw new StreamError(
        `Failed to create ReadableStream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'READABLE_STREAM_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建可写流
   * @param sink 流接收器
   * @param options 选项
   */
  static createWritableStream<T>(
    sink: WritableStreamSink<T>,
    options: StreamOptions = {}
  ): WritableStream<T> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('writableStream')) {
      throw new StreamError(
        'WritableStream not supported in this environment',
        'WRITABLE_STREAM_NOT_SUPPORTED'
      );
    }

    try {
      const strategy = this.createQueuingStrategy<T>(options);
      
      return new WritableStream<T>(sink, strategy);
    } catch (error) {
      throw new StreamError(
        `Failed to create WritableStream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'WRITABLE_STREAM_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建转换流
   * @param transformer 转换器
   * @param options 选项
   */
  static createTransformStream<I, O>(
    transformer: StreamTransformer<I, O>,
    options: StreamOptions = {}
  ): TransformStream<I, O> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('transformStream')) {
      throw new StreamError(
        'TransformStream not supported in this environment',
        'TRANSFORM_STREAM_NOT_SUPPORTED'
      );
    }

    try {
      const readableStrategy = this.createQueuingStrategy<O>(options);
      const writableStrategy = this.createQueuingStrategy<I>(options);
      
      return new TransformStream<I, O>(transformer, writableStrategy, readableStrategy);
    } catch (error) {
      throw new StreamError(
        `Failed to create TransformStream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRANSFORM_STREAM_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建队列策略
   */
  private static createQueuingStrategy<T>(options: StreamOptions): QueuingStrategy<T> {
    const highWaterMark = options.highWaterMark || this.DEFAULT_HIGH_WATER_MARK;
    
    if (options.strategy) {
      return {
        highWaterMark,
        ...options.strategy
      };
    }

    return {
      highWaterMark,
      size: (chunk: T) => {
        if (chunk instanceof ArrayBuffer) {
          return chunk.byteLength;
        }
        if (chunk instanceof Uint8Array) {
          return chunk.byteLength;
        }
        if (typeof chunk === 'string') {
          return chunk.length;
        }
        return 1;
      }
    };
  }

  /**
   * 将BinaryData转换为可读流
   * @param binaryData 二进制数据
   * @param chunkSize 分块大小
   */
  static binaryToStream(
    binaryData: BinaryData,
    chunkSize: number = this.DEFAULT_CHUNK_SIZE
  ): ReadableStream<Uint8Array> {
    const arrayBuffer = binaryData.toArrayBuffer();
    let offset = 0;

    return this.createReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= arrayBuffer.byteLength) {
          controller.close();
          return;
        }

        const remainingBytes = arrayBuffer.byteLength - offset;
        const currentChunkSize = Math.min(chunkSize, remainingBytes);
        
        const chunk = new Uint8Array(arrayBuffer, offset, currentChunkSize);
        controller.enqueue(chunk);
        
        offset += currentChunkSize;
      }
    });
  }

  /**
   * 将可读流转换为BinaryData
   * @param stream 可读流
   * @param options 转换选项
   */
  static async streamToBinary(
    stream: ReadableStream<Uint8Array>,
    options: StreamConversionOptions = {}
  ): Promise<BinaryData> {
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    let processedChunks = 0;

    try {
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        if (value) {
          chunks.push(value);
          totalSize += value.byteLength;
          processedChunks++;

          // 内存检查
          if (totalSize > 100 * 1024 * 1024) { // 100MB限制
            throw new MemoryError(
              'Stream data exceeds memory limit',
              totalSize,
              100 * 1024 * 1024
            );
          }

          // 进度回调
          if (options.onProgress) {
            options.onProgress({
              processed: processedChunks,
              total: options.preserveOrder ? undefined : processedChunks
            });
          }
        }
      }

      reader.releaseLock();

      // 合并所有块
      const combinedBuffer = new ArrayBuffer(totalSize);
      const combinedView = new Uint8Array(combinedBuffer);
      let offset = 0;

      for (const chunk of chunks) {
        combinedView.set(chunk, offset);
        offset += chunk.byteLength;
      }

      return BinaryData.from(combinedBuffer);
      
    } catch (error) {
      throw new StreamError(
        `Failed to convert stream to binary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STREAM_TO_BINARY_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 管道连接流
   * @param readable 可读流
   * @param writable 可写流
   * @param options 管道选项
   */
  static async pipeThrough<T, U>(
    readable: ReadableStream<T>,
    transform: TransformStream<T, U>,
    options: PipeOptions = {}
  ): Promise<ReadableStream<U>> {
    try {
      return readable.pipeThrough(transform, options);
    } catch (error) {
      throw new StreamError(
        `Failed to pipe through transform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PIPE_THROUGH_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 管道连接到可写流
   * @param readable 可读流
   * @param writable 可写流
   * @param options 管道选项
   */
  static async pipeTo<T>(
    readable: ReadableStream<T>,
    writable: WritableStream<T>,
    options: PipeOptions = {}
  ): Promise<void> {
    try {
      await readable.pipeTo(writable, options);
    } catch (error) {
      throw new StreamError(
        `Failed to pipe to writable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PIPE_TO_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建分块转换流
   * @param chunkSize 分块大小
   */
  static createChunkingTransform(chunkSize: number): TransformStream<Uint8Array, Uint8Array> {
    let buffer = new Uint8Array(0);

    return this.createTransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        // 合并到缓冲区
        const newBuffer = new Uint8Array(buffer.length + chunk.length);
        newBuffer.set(buffer);
        newBuffer.set(chunk, buffer.length);
        buffer = newBuffer;

        // 输出完整的块
        while (buffer.length >= chunkSize) {
          const outputChunk = buffer.slice(0, chunkSize);
          controller.enqueue(outputChunk);
          buffer = buffer.slice(chunkSize);
        }
      },
      
      flush(controller) {
        // 输出剩余数据
        if (buffer.length > 0) {
          controller.enqueue(buffer);
        }
      }
    });
  }

  /**
   * 创建压缩转换流
   * @param format 压缩格式
   */
  static createCompressionTransform(
    format: 'gzip' | 'deflate'
  ): TransformStream<Uint8Array, Uint8Array> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('compressionStreams')) {
      throw new StreamError(
        'Compression streams not supported in this environment',
        'COMPRESSION_NOT_SUPPORTED'
      );
    }

    try {
      return new CompressionStream(format);
    } catch (error) {
      throw new StreamError(
        `Failed to create compression stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPRESSION_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建解压缩转换流
   * @param format 压缩格式
   */
  static createDecompressionTransform(
    format: 'gzip' | 'deflate'
  ): TransformStream<Uint8Array, Uint8Array> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('compressionStreams')) {
      throw new StreamError(
        'Compression streams not supported in this environment',
        'COMPRESSION_NOT_SUPPORTED'
      );
    }

    try {
      return new DecompressionStream(format);
    } catch (error) {
      throw new StreamError(
        `Failed to create decompression stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DECOMPRESSION_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建文本编码转换流
   * @param encoding 编码格式
   */
  static createTextEncoderTransform(
    encoding: string = 'utf-8'
  ): TransformStream<string, Uint8Array> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('textEncoder')) {
      throw new StreamError(
        'TextEncoder not supported in this environment',
        'TEXT_ENCODER_NOT_SUPPORTED'
      );
    }

    const encoder = new TextEncoder();

    return this.createTransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        try {
          const encoded = encoder.encode(chunk);
          controller.enqueue(encoded);
        } catch (error) {
          controller.error(new StreamError(
            `Text encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'TEXT_ENCODING_ERROR',
            error instanceof Error ? error : undefined
          ));
        }
      }
    });
  }

  /**
   * 创建文本解码转换流
   * @param encoding 编码格式
   */
  static createTextDecoderTransform(
    encoding: string = 'utf-8'
  ): TransformStream<Uint8Array, string> {
    const compatibilityManager = getDefaultCompatibilityManager();
    
    if (!compatibilityManager.isSupported('textDecoder')) {
      throw new StreamError(
        'TextDecoder not supported in this environment',
        'TEXT_DECODER_NOT_SUPPORTED'
      );
    }

    const decoder = new TextDecoder(encoding);

    return this.createTransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        try {
          const decoded = decoder.decode(chunk, { stream: true });
          if (decoded) {
            controller.enqueue(decoded);
          }
        } catch (error) {
          controller.error(new StreamError(
            `Text decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'TEXT_DECODING_ERROR',
            error instanceof Error ? error : undefined
          ));
        }
      },
      
      flush(controller) {
        try {
          const final = decoder.decode();
          if (final) {
            controller.enqueue(final);
          }
        } catch (error) {
          controller.error(new StreamError(
            `Text decoding flush failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'TEXT_DECODING_ERROR',
            error instanceof Error ? error : undefined
          ));
        }
      }
    });
  }

  /**
   * 创建流统计收集器
   */
  static createStatsCollector<T>(): {
    transform: TransformStream<T, T>;
    getStats: () => StreamStats;
  } {
    const stats: StreamStats = {
      bytesRead: 0,
      bytesWritten: 0,
      chunksProcessed: 0,
      startTime: Date.now(),
      state: 'readable'
    };

    const transform = this.createTransformStream<T, T>({
      start() {
        stats.startTime = Date.now();
        stats.state = 'readable';
      },
      
      transform(chunk, controller) {
        stats.chunksProcessed++;
        
        // 估算字节数
        if (chunk instanceof Uint8Array) {
          stats.bytesRead += chunk.byteLength;
          stats.bytesWritten += chunk.byteLength;
        } else if (typeof chunk === 'string') {
          stats.bytesRead += chunk.length;
          stats.bytesWritten += chunk.length;
        }
        
        controller.enqueue(chunk);
      },
      
      flush() {
        stats.state = 'closed';
      }
    });

    return {
      transform,
      getStats: () => ({ ...stats })
    };
  }

  /**
   * 创建背压控制转换流
   * @param maxBufferSize 最大缓冲区大小
   */
  static createBackpressureTransform<T>(
    maxBufferSize: number
  ): TransformStream<T, T> {
    let bufferSize = 0;

    return this.createTransformStream<T, T>({
      transform(chunk, controller) {
        // 估算块大小
        let chunkSize = 1;
        if (chunk instanceof Uint8Array) {
          chunkSize = chunk.byteLength;
        } else if (typeof chunk === 'string') {
          chunkSize = chunk.length;
        }

        bufferSize += chunkSize;

        if (bufferSize > maxBufferSize) {
          controller.error(new MemoryError(
            'Buffer size exceeded maximum limit',
            bufferSize,
            maxBufferSize
          ));
          return;
        }

        controller.enqueue(chunk);
      }
    });
  }

  /**
   * 创建自定义处理器转换流
   * @param processor 处理器
   */
  static createProcessorTransform<I, O>(
    processor: StreamProcessor<I, O>
  ): TransformStream<I, O> {
    return this.createTransformStream<I, O>({
      async transform(chunk, controller) {
        try {
          const result = await processor.processChunk(chunk);
          controller.enqueue(result);
        } catch (error) {
          if (processor.onError) {
            await processor.onError(error as Error);
          }
          controller.error(error);
        }
      },
      
      async flush() {
        if (processor.onComplete) {
          await processor.onComplete();
        }
      }
    });
  }
}