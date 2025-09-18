/**
 * Stream模块集成测试
 * 测试各个模块之间的协作和端到端功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  initStreamModule,
  BinaryData,
  DataTransfer,
  StreamOperations,
  CompatibilityManager,
  integrateStreamModule,
  getIntegrationStatus,
  resetAllIntegrations,
  resetModule
} from '../index';
import { TestDataGenerator, setupStreamTests, MockUtils } from './setup';

// Mock fetch for integration tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Stream模块集成测试', () => {
  setupStreamTests();

  beforeEach(() => {
    resetModule();
    resetAllIntegrations();
    mockFetch.mockReset();
  });

  afterEach(() => {
    resetModule();
    resetAllIntegrations();
  });

  describe('模块初始化', () => {
    it('应该成功初始化Stream模块', async () => {
      await expect(initStreamModule({
        debug: true,
        compatibility: {
          autoLoadPolyfills: false // 避免在测试中加载polyfill
        }
      })).resolves.not.toThrow();
    });

    it('应该支持自定义配置初始化', async () => {
      await initStreamModule({
        debug: false,
        transfer: {
          timeout: 5000,
          retryCount: 2,
          chunkSize: 512 * 1024
        },
        compatibility: {
          autoLoadPolyfills: false
        }
      });

      // 验证配置生效
      const transfer = new DataTransfer();
      expect(transfer).toBeInstanceOf(DataTransfer);
    });
  });

  describe('端到端数据处理流程', () => {
    beforeEach(async () => {
      await initStreamModule({
        debug: true,
        compatibility: {
          autoLoadPolyfills: false
        }
      });
    });

    it('应该完成完整的数据处理流程', async () => {
      // 1. 创建测试数据
      const testData = TestDataGenerator.generateBinaryData(5000);
      const binaryData = BinaryData.from(testData);

      // 2. 转换为流
      const stream = StreamOperations.binaryToStream(binaryData, 1024);

      // 3. 流处理
      const processedStream = stream.pipeThrough(
        StreamOperations.createTransformStream({
          transform(chunk, controller) {
            // 简单处理：每个字节+1
            const processed = new Uint8Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
              processed[i] = (chunk[i] + 1) % 256;
            }
            controller.enqueue(processed);
          }
        })
      );

      // 4. 转换回BinaryData
      const result = await StreamOperations.streamToBinary(processedStream);

      // 5. 验证结果
      expect(result.size).toBe(binaryData.size);
      
      const originalArray = binaryData.toUint8Array();
      const resultArray = result.toUint8Array();
      
      for (let i = 0; i < originalArray.length; i++) {
        expect(resultArray[i]).toBe((originalArray[i] + 1) % 256);
      }
    });

    it('应该支持复杂的流处理管道', async () => {
      const textData = BinaryData.fromText('Hello, World! This is a test message.');
      
      // 创建复杂的处理管道
      const sourceStream = StreamOperations.binaryToStream(textData, 10);
      
      const { transform: statsTransform, getStats } = StreamOperations.createStatsCollector<Uint8Array>();
      
      const processedStream = sourceStream
        .pipeThrough(statsTransform)
        .pipeThrough(StreamOperations.createChunkingTransform(5))
        .pipeThrough(StreamOperations.createTransformStream({
          transform(chunk, controller) {
            // 转换为大写（简化处理）
            const processed = new Uint8Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
              const char = chunk[i];
              if (char >= 97 && char <= 122) { // a-z
                processed[i] = char - 32; // 转换为大写
              } else {
                processed[i] = char;
              }
            }
            controller.enqueue(processed);
          }
        }));

      const result = await StreamOperations.streamToBinary(processedStream);
      const resultText = await result.toText();
      
      expect(resultText).toBe('HELLO, WORLD! THIS IS A TEST MESSAGE.');
      
      const stats = getStats();
      expect(stats.chunksProcessed).toBeGreaterThan(0);
      expect(stats.bytesRead).toBe(textData.size);
    });
  });

  describe('数据传输集成', () => {
    beforeEach(async () => {
      await initStreamModule({
        compatibility: {
          autoLoadPolyfills: false
        }
      });
    });

    it('应该支持多种传输方式的组合使用', async () => {
      const testData = BinaryData.from(TestDataGenerator.generateBinaryData(10000));
      const transfer = new DataTransfer({
        chunkSize: 2000,
        retryCount: 2
      });

      // Mock成功响应
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'test-upload' })
      });

      // 测试分页传输
      const paginatedResult = await transfer.paginatedTransfer('/api/paginated', testData, {
        pageSize: 3000,
        parallel: false
      });

      expect(paginatedResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalled();

      // 重置mock
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'test-stream' })
      });

      // 测试流式传输
      const streamResult = await transfer.streamTransfer('/api/stream', testData, {
        chunkSize: 1500
      });

      expect(streamResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('应该正确处理传输错误和重试', async () => {
      const testData = BinaryData.from(TestDataGenerator.generateBinaryData(1000));
      const transfer = new DataTransfer({
        retryCount: 2,
        retryDelay: 100
      });

      // 前两次失败，第三次成功
      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const result = await transfer.streamTransfer('/api/retry-test', testData, {
        chunkSize: 500
      });

      expect(result.success).toBe(true);
      expect(result.stats.retryCount).toBeGreaterThan(0);
    });
  });

  describe('兼容性管理集成', () => {
    it('应该正确检测和处理兼容性问题', async () => {
      const compatibilityManager = CompatibilityManager.getInstance();
      
      // 检查兼容性
      const compatibilityResult = compatibilityManager.checkCompatibility();
      expect(compatibilityResult).toHaveProperty('compatible');
      expect(compatibilityResult).toHaveProperty('supportedFeatures');
      expect(compatibilityResult).toHaveProperty('unsupportedFeatures');

      // 生成报告
      const report = compatibilityManager.generateReport();
      expect(report).toHaveProperty('features');
      expect(report).toHaveProperty('browser');
      expect(report).toHaveProperty('environment');
      expect(report).toHaveProperty('summary');
    });

    it('应该支持降级策略', async () => {
      const compatibilityManager = CompatibilityManager.getInstance();
      
      // 测试不存在的特性的降级
      try {
        await compatibilityManager.executeFallback('nonexistent-feature');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('模块集成功能', () => {
    it('应该成功执行一键集成', async () => {
      const integrations = await integrateStreamModule({
        enableTracking: true,
        enableUniversal: true,
        enableLazyLoader: true,
        debug: false,
        trackingConfig: {
          trackingEnabled: true,
          flushInterval: 1000
        },
        universalConfig: {
          autoPolyfill: false,
          loadStrategy: 'lazy'
        },
        lazyLoaderConfig: {
          preloadStrategy: 'critical',
          enableCache: true
        }
      });

      expect(integrations).toHaveProperty('tracker');
      expect(integrations).toHaveProperty('universalAdapter');
      expect(integrations).toHaveProperty('lazyLoader');

      // 检查集成状态
      const status = getIntegrationStatus();
      expect(status.tracking).toBe(true);
      expect(status.universal).toBe(true);
      expect(status.lazyLoader).toBe(true);
    });

    it('应该支持选择性集成', async () => {
      // 只启用Tracking集成
      const integrations = await integrateStreamModule({
        enableTracking: true,
        enableUniversal: false,
        enableLazyLoader: false
      });

      expect(integrations).toHaveProperty('tracker');
      expect(integrations).not.toHaveProperty('universalAdapter');
      expect(integrations).not.toHaveProperty('lazyLoader');

      const status = getIntegrationStatus();
      expect(status.tracking).toBe(true);
      expect(status.universal).toBe(false);
      expect(status.lazyLoader).toBe(false);
    });
  });

  describe('性能和内存管理', () => {
    beforeEach(async () => {
      await initStreamModule({
        compatibility: {
          autoLoadPolyfills: false
        }
      });
    });

    it('应该正确处理大数据流', async () => {
      const largeData = BinaryData.from(TestDataGenerator.generateBinaryData(100000));
      
      // 使用小的分块大小来测试分块处理
      const stream = StreamOperations.binaryToStream(largeData, 1024);
      
      let chunkCount = 0;
      const countingTransform = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          chunkCount++;
          controller.enqueue(chunk);
        }
      });

      const processedStream = stream.pipeThrough(countingTransform);
      const result = await StreamOperations.streamToBinary(processedStream);

      expect(result.size).toBe(largeData.size);
      expect(chunkCount).toBeGreaterThan(90); // 应该有很多分块
      expect(result.equals(largeData)).toBe(true);
    });

    it('应该支持背压控制', async () => {
      const testData = BinaryData.from(TestDataGenerator.generateBinaryData(10000));
      const stream = StreamOperations.binaryToStream(testData, 1000);

      // 创建背压控制转换流
      const backpressureTransform = StreamOperations.createBackpressureTransform<Uint8Array>(5000);
      
      // 这应该不会触发内存错误，因为数据量在限制内
      const processedStream = stream.pipeThrough(backpressureTransform);
      const result = await StreamOperations.streamToBinary(processedStream);

      expect(result.size).toBe(testData.size);
    });
  });

  describe('错误处理和恢复', () => {
    beforeEach(async () => {
      await initStreamModule({
        compatibility: {
          autoLoadPolyfills: false
        }
      });
    });

    it('应该正确处理流处理错误', async () => {
      const testData = BinaryData.from(TestDataGenerator.generateBinaryData(1000));
      const stream = StreamOperations.binaryToStream(testData, 100);

      // 创建会抛出错误的转换流
      const errorTransform = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          if (chunk.length > 50) {
            controller.error(new Error('Chunk too large'));
            return;
          }
          controller.enqueue(chunk);
        }
      });

      const processedStream = stream.pipeThrough(errorTransform);

      await expect(
        StreamOperations.streamToBinary(processedStream)
      ).rejects.toThrow('Chunk too large');
    });

    it('应该支持错误恢复和重试', async () => {
      const testData = BinaryData.from(TestDataGenerator.generateBinaryData(1000));
      const transfer = new DataTransfer({
        retryCount: 3,
        retryDelay: 50
      });

      let attemptCount = 0;
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error(`Attempt ${attemptCount} failed`));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, attempt: attemptCount })
        });
      });

      const result = await transfer.streamTransfer('/api/retry', testData, {
        chunkSize: 500
      });

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
      expect(result.stats.retryCount).toBeGreaterThan(0);
    });
  });

  describe('类型安全和API一致性', () => {
    it('应该保持类型安全', async () => {
      // 这个测试主要验证TypeScript类型系统
      const binaryData: BinaryData = BinaryData.from('test');
      const transfer: DataTransfer = new DataTransfer();
      const operations = StreamOperations;

      expect(binaryData).toBeInstanceOf(BinaryData);
      expect(transfer).toBeInstanceOf(DataTransfer);
      expect(typeof operations.createReadableStream).toBe('function');
    });

    it('应该提供一致的API接口', () => {
      // 验证所有主要类都有预期的方法
      expect(typeof BinaryData.from).toBe('function');
      expect(typeof BinaryData.fromAsync).toBe('function');
      expect(typeof BinaryData.fromBase64).toBe('function');
      expect(typeof BinaryData.fromText).toBe('function');

      expect(typeof StreamOperations.createReadableStream).toBe('function');
      expect(typeof StreamOperations.createWritableStream).toBe('function');
      expect(typeof StreamOperations.createTransformStream).toBe('function');
      expect(typeof StreamOperations.binaryToStream).toBe('function');
      expect(typeof StreamOperations.streamToBinary).toBe('function');

      const transfer = new DataTransfer();
      expect(typeof transfer.paginatedTransfer).toBe('function');
      expect(typeof transfer.streamTransfer).toBe('function');
      expect(typeof transfer.compressedTransfer).toBe('function');
      expect(typeof transfer.resumableTransfer).toBe('function');
    });
  });
});