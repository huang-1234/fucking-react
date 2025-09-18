/**
 * StreamOperations类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StreamOperations } from '../core/StreamOperations';
import { BinaryData } from '../core/BinaryData';
import { StreamError, MemoryError } from '../utils/errors';
import { TestDataGenerator, setupStreamTests, MockUtils } from './setup';

describe('StreamOperations', () => {
  setupStreamTests();

  describe('流创建', () => {
    it('应该创建可读流', () => {
      const source = {
        start(controller: ReadableStreamDefaultController<string>) {
          controller.enqueue('test');
          controller.close();
        }
      };

      const stream = StreamOperations.createReadableStream(source);
      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it('应该创建可写流', () => {
      const sink = {
        write(chunk: string) {
          // 处理写入的数据
        }
      };

      const stream = StreamOperations.createWritableStream(sink);
      expect(stream).toBeInstanceOf(WritableStream);
    });

    it('应该创建转换流', () => {
      const transformer = {
        transform(chunk: string, controller: TransformStreamDefaultController<string>) {
          controller.enqueue(chunk.toUpperCase());
        }
      };

      const stream = StreamOperations.createTransformStream(transformer);
      expect(stream).toBeInstanceOf(TransformStream);
      expect(stream.readable).toBeInstanceOf(ReadableStream);
      expect(stream.writable).toBeInstanceOf(WritableStream);
    });

    it('应该支持自定义队列策略', () => {
      const source = {
        start(controller: ReadableStreamDefaultController<string>) {
          controller.enqueue('test');
          controller.close();
        }
      };

      const options = {
        highWaterMark: 1024,
        strategy: {
          size: (chunk: string) => chunk.length
        }
      };

      const stream = StreamOperations.createReadableStream(source, options);
      expect(stream).toBeInstanceOf(ReadableStream);
    });
  });

  describe('BinaryData与流转换', () => {
    it('应该将BinaryData转换为流', async () => {
      const testData = TestDataGenerator.generateBinaryData(100);
      const binaryData = BinaryData.from(testData);
      
      const stream = StreamOperations.binaryToStream(binaryData, 32);
      expect(stream).toBeInstanceOf(ReadableStream);

      // 读取流数据
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      // 验证数据完整性
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalLength).toBe(100);
    });

    it('应该将流转换为BinaryData', async () => {
      const testData = TestDataGenerator.generateBinaryData(100);
      const originalBinaryData = BinaryData.from(testData);
      
      // 创建流
      const stream = StreamOperations.binaryToStream(originalBinaryData, 32);
      
      // 转换回BinaryData
      const resultBinaryData = await StreamOperations.streamToBinary(stream);
      
      expect(resultBinaryData.size).toBe(100);
      expect(resultBinaryData.equals(originalBinaryData)).toBe(true);
    });

    it('应该处理大数据流的内存限制', async () => {
      // 创建一个模拟的大数据流
      const largeStream = new ReadableStream({
        start(controller) {
          // 模拟超过内存限制的数据
          for (let i = 0; i < 1000; i++) {
            controller.enqueue(new Uint8Array(1024 * 1024)); // 1MB chunks
          }
          controller.close();
        }
      });

      await expect(
        StreamOperations.streamToBinary(largeStream)
      ).rejects.toThrow(MemoryError);
    });

    it('应该支持进度回调', async () => {
      const testData = TestDataGenerator.generateBinaryData(100);
      const binaryData = BinaryData.from(testData);
      const stream = StreamOperations.binaryToStream(binaryData, 25);

      const progressMock = MockUtils.createProgressMock();
      
      await StreamOperations.streamToBinary(stream, {
        onProgress: progressMock.callback
      });

      expect(progressMock.getCallCount()).toBeGreaterThan(0);
    });
  });

  describe('流管道操作', () => {
    it('应该支持pipeThrough操作', async () => {
      // 创建源流
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue('hello');
          controller.enqueue('world');
          controller.close();
        }
      });

      // 创建转换流
      const transformStream = StreamOperations.createTransformStream({
        transform(chunk: string, controller) {
          controller.enqueue(chunk.toUpperCase());
        }
      });

      // 执行pipeThrough
      const resultStream = await StreamOperations.pipeThrough(
        sourceStream,
        transformStream
      );

      // 读取结果
      const reader = resultStream.getReader();
      const results: string[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) results.push(value);
      }

      expect(results).toEqual(['HELLO', 'WORLD']);
    });

    it('应该支持pipeTo操作', async () => {
      const results: string[] = [];
      
      // 创建源流
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue('test1');
          controller.enqueue('test2');
          controller.close();
        }
      });

      // 创建目标流
      const targetStream = new WritableStream({
        write(chunk: string) {
          results.push(chunk);
        }
      });

      // 执行pipeTo
      await StreamOperations.pipeTo(sourceStream, targetStream);

      expect(results).toEqual(['test1', 'test2']);
    });
  });

  describe('专用转换流', () => {
    it('应该创建分块转换流', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(data);
          controller.close();
        }
      });

      const chunkingTransform = StreamOperations.createChunkingTransform(3);
      const resultStream = sourceStream.pipeThrough(chunkingTransform);

      const reader = resultStream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].length).toBe(3);
    });

    it('应该创建文本编码转换流', async () => {
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello');
          controller.enqueue(' World');
          controller.close();
        }
      });

      const encoderTransform = StreamOperations.createTextEncoderTransform();
      const resultStream = sourceStream.pipeThrough(encoderTransform);

      const reader = resultStream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      expect(chunks.length).toBe(2);
      expect(chunks[0]).toBeInstanceOf(Uint8Array);
    });

    it('应该创建文本解码转换流', async () => {
      const encoder = new TextEncoder();
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('Hello'));
          controller.enqueue(encoder.encode(' World'));
          controller.close();
        }
      });

      const decoderTransform = StreamOperations.createTextDecoderTransform();
      const resultStream = sourceStream.pipeThrough(decoderTransform);

      const reader = resultStream.getReader();
      const chunks: string[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      expect(chunks.join('')).toBe('Hello World');
    });
  });

  describe('流统计和监控', () => {
    it('应该收集流统计信息', async () => {
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3]));
          controller.enqueue(new Uint8Array([4, 5, 6]));
          controller.close();
        }
      });

      const { transform, getStats } = StreamOperations.createStatsCollector<Uint8Array>();
      const resultStream = sourceStream.pipeThrough(transform);

      // 消费流
      const reader = resultStream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      const stats = getStats();
      expect(stats.chunksProcessed).toBe(2);
      expect(stats.bytesRead).toBe(6);
      expect(stats.startTime).toBeGreaterThan(0);
    });

    it('应该支持背压控制', async () => {
      const largeChunk = new Uint8Array(1000);
      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(largeChunk);
          controller.close();
        }
      });

      const backpressureTransform = StreamOperations.createBackpressureTransform<Uint8Array>(500);
      const resultStream = sourceStream.pipeThrough(backpressureTransform);

      const reader = resultStream.getReader();
      
      await expect(reader.read()).rejects.toThrow(MemoryError);
    });
  });

  describe('自定义处理器', () => {
    it('应该支持自定义流处理器', async () => {
      const processor = {
        processChunk: vi.fn().mockImplementation((chunk: number) => chunk * 2),
        onComplete: vi.fn(),
        onError: vi.fn()
      };

      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        }
      });

      const processorTransform = StreamOperations.createProcessorTransform(processor);
      const resultStream = sourceStream.pipeThrough(processorTransform);

      const reader = resultStream.getReader();
      const results: number[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) results.push(value);
      }

      expect(results).toEqual([2, 4, 6]);
      expect(processor.processChunk).toHaveBeenCalledTimes(3);
      expect(processor.onComplete).toHaveBeenCalledTimes(1);
    });

    it('应该处理处理器错误', async () => {
      const processor = {
        processChunk: vi.fn().mockRejectedValue(new Error('Processing failed')),
        onError: vi.fn()
      };

      const sourceStream = new ReadableStream({
        start(controller) {
          controller.enqueue('test');
          controller.close();
        }
      });

      const processorTransform = StreamOperations.createProcessorTransform(processor);
      const resultStream = sourceStream.pipeThrough(processorTransform);

      const reader = resultStream.getReader();
      
      await expect(reader.read()).rejects.toThrow('Processing failed');
      expect(processor.onError).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理流创建错误', () => {
      // 模拟不支持的环境
      const originalReadableStream = globalThis.ReadableStream;
      delete (globalThis as any).ReadableStream;

      expect(() => {
        StreamOperations.createReadableStream({});
      }).toThrow(StreamError);

      // 恢复
      globalThis.ReadableStream = originalReadableStream;
    });

    it('应该处理管道操作错误', async () => {
      const errorStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream error'));
        }
      });

      const targetStream = new WritableStream({
        write() {
          // 正常写入
        }
      });

      await expect(
        StreamOperations.pipeTo(errorStream, targetStream)
      ).rejects.toThrow(StreamError);
    });
  });
});