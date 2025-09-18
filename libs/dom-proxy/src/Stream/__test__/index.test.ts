/**
 * Stream模块测试套件主入口
 * 运行所有测试并生成覆盖率报告
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  initStreamModule,
  resetModule,
  getModuleConfig,
  isModuleInitialized,
  VERSION,
  STREAM_CONSTANTS
} from '../index';

describe('Stream模块测试套件', () => {
  beforeAll(async () => {
    // 初始化测试环境
    await initStreamModule({
      debug: false,
      compatibility: {
        autoLoadPolyfills: false
      }
    });
  });

  afterAll(() => {
    // 清理测试环境
    resetModule();
  });

  describe('模块基础功能', () => {
    it('应该正确导出版本信息', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('应该正确导出常量', () => {
      expect(STREAM_CONSTANTS).toBeDefined();
      expect(STREAM_CONSTANTS.DEFAULT_CHUNK_SIZE).toBe(1024 * 1024);
      expect(STREAM_CONSTANTS.DEFAULT_TIMEOUT).toBe(30000);
      expect(STREAM_CONSTANTS.DEFAULT_RETRY_COUNT).toBe(3);
      expect(STREAM_CONSTANTS.MAX_CONCURRENCY).toBe(10);
    });

    it('应该正确管理模块状态', () => {
      expect(isModuleInitialized()).toBe(true);
      
      const config = getModuleConfig();
      expect(config).toBeDefined();
      expect(config).toHaveProperty('compatibility');
      expect(config).toHaveProperty('transfer');
      expect(config).toHaveProperty('stream');
    });

    it('应该支持模块重置', () => {
      resetModule();
      expect(isModuleInitialized()).toBe(false);
      
      // 重新初始化
      return initStreamModule({
        compatibility: {
          autoLoadPolyfills: false
        }
      });
    });
  });

  describe('API完整性检查', () => {
    it('应该导出所有核心类', async () => {
      const { 
        BinaryData, 
        DataTransfer, 
        StreamOperations, 
        CompatibilityManager 
      } = await import('../index');

      expect(BinaryData).toBeDefined();
      expect(DataTransfer).toBeDefined();
      expect(StreamOperations).toBeDefined();
      expect(CompatibilityManager).toBeDefined();

      expect(typeof BinaryData).toBe('function');
      expect(typeof DataTransfer).toBe('function');
      expect(typeof StreamOperations).toBe('object');
      expect(typeof CompatibilityManager).toBe('function');
    });

    it('应该导出所有错误类', async () => {
      const {
        StreamError,
        CompatibilityError,
        TransferError,
        DataFormatError,
        MemoryError,
        ErrorHandler
      } = await import('../index');

      expect(StreamError).toBeDefined();
      expect(CompatibilityError).toBeDefined();
      expect(TransferError).toBeDefined();
      expect(DataFormatError).toBeDefined();
      expect(MemoryError).toBeDefined();
      expect(ErrorHandler).toBeDefined();

      expect(typeof StreamError).toBe('function');
      expect(typeof CompatibilityError).toBe('function');
      expect(typeof TransferError).toBe('function');
      expect(typeof DataFormatError).toBe('function');
      expect(typeof MemoryError).toBe('function');
      expect(typeof ErrorHandler).toBe('function');
    });

    it('应该导出所有工具函数', async () => {
      const {
        detectFeatures,
        getBrowserInfo,
        getEnvironmentInfo,
        formatBytes,
        calculateSpeed,
        createProgressTracker
      } = await import('../index');

      expect(detectFeatures).toBeDefined();
      expect(getBrowserInfo).toBeDefined();
      expect(getEnvironmentInfo).toBeDefined();
      expect(formatBytes).toBeDefined();
      expect(calculateSpeed).toBeDefined();
      expect(createProgressTracker).toBeDefined();

      expect(typeof detectFeatures).toBe('function');
      expect(typeof getBrowserInfo).toBe('function');
      expect(typeof getEnvironmentInfo).toBe('function');
      expect(typeof formatBytes).toBe('function');
      expect(typeof calculateSpeed).toBe('function');
      expect(typeof createProgressTracker).toBe('function');
    });

    it('应该导出所有集成功能', async () => {
      const {
        integrateStreamModule,
        getIntegrationStatus,
        DataTransferTracker,
        StreamUniversalAdapter,
        StreamLazyLoader
      } = await import('../index');

      expect(integrateStreamModule).toBeDefined();
      expect(getIntegrationStatus).toBeDefined();
      expect(DataTransferTracker).toBeDefined();
      expect(StreamUniversalAdapter).toBeDefined();
      expect(StreamLazyLoader).toBeDefined();

      expect(typeof integrateStreamModule).toBe('function');
      expect(typeof getIntegrationStatus).toBe('function');
      expect(typeof DataTransferTracker).toBe('function');
      expect(typeof StreamUniversalAdapter).toBe('function');
      expect(typeof StreamLazyLoader).toBe('function');
    });

    it('应该导出所有类型定义', async () => {
      // 这个测试主要验证TypeScript类型导出
      // 在运行时，类型定义不会存在，但编译时会验证
      const module = await import('../index');
      
      // 验证模块结构
      expect(module).toHaveProperty('BinaryData');
      expect(module).toHaveProperty('DataTransfer');
      expect(module).toHaveProperty('StreamOperations');
      expect(module).toHaveProperty('CompatibilityManager');
    });
  });

  describe('类型守卫函数', () => {
    it('应该正确识别BinaryDataInput', async () => {
      const { isBinaryDataInput } = await import('../index');

      expect(isBinaryDataInput(new ArrayBuffer(10))).toBe(true);
      expect(isBinaryDataInput(new Uint8Array(10))).toBe(true);
      expect(isBinaryDataInput('test string')).toBe(true);
      expect(isBinaryDataInput(new Blob(['test']))).toBe(true);
      
      expect(isBinaryDataInput(null)).toBe(false);
      expect(isBinaryDataInput(undefined)).toBe(false);
      expect(isBinaryDataInput(123)).toBe(false);
      expect(isBinaryDataInput({})).toBe(false);
    });

    it('应该正确识别ReadableStream', async () => {
      const { isReadableStream } = await import('../index');

      if (typeof ReadableStream !== 'undefined') {
        const stream = new ReadableStream();
        expect(isReadableStream(stream)).toBe(true);
      }

      expect(isReadableStream(null)).toBe(false);
      expect(isReadableStream({})).toBe(false);
      expect(isReadableStream({ getReader: 'not a function' })).toBe(false);
    });

    it('应该正确识别WritableStream', async () => {
      const { isWritableStream } = await import('../index');

      if (typeof WritableStream !== 'undefined') {
        const stream = new WritableStream();
        expect(isWritableStream(stream)).toBe(true);
      }

      expect(isWritableStream(null)).toBe(false);
      expect(isWritableStream({})).toBe(false);
      expect(isWritableStream({ getWriter: 'not a function' })).toBe(false);
    });

    it('应该正确识别TransformStream', async () => {
      const { isTransformStream } = await import('../index');

      if (typeof TransformStream !== 'undefined') {
        const stream = new TransformStream();
        expect(isTransformStream(stream)).toBe(true);
      }

      expect(isTransformStream(null)).toBe(false);
      expect(isTransformStream({})).toBe(false);
      expect(isTransformStream({ readable: null, writable: null })).toBe(false);
    });
  });

  describe('工具函数验证', () => {
    it('应该正确格式化字节数', async () => {
      const { formatBytes } = await import('../index');

      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('应该正确计算速度', async () => {
      const { calculateSpeed } = await import('../index');

      expect(calculateSpeed(1000, 1000)).toBe(1000); // 1000 bytes in 1000ms = 1000 bytes/s
      expect(calculateSpeed(2048, 2000)).toBe(1024); // 2048 bytes in 2000ms = 1024 bytes/s
      expect(calculateSpeed(1000, 0)).toBe(0); // 除零保护
    });

    it('应该创建有效的进度跟踪器', async () => {
      const { createProgressTracker } = await import('../index');

      const tracker = createProgressTracker();
      expect(typeof tracker).toBe('function');

      const progress1 = tracker(500, 1000);
      expect(progress1.loaded).toBe(500);
      expect(progress1.total).toBe(1000);
      expect(progress1.percentage).toBe(50);

      const progress2 = tracker(1000, 1000);
      expect(progress2.percentage).toBe(100);
    });
  });

  describe('错误处理验证', () => {
    it('应该创建正确的错误对象', async () => {
      const {
        StreamError,
        CompatibilityError,
        TransferError,
        DataFormatError,
        MemoryError
      } = await import('../index');

      const streamError = new StreamError('Test message', 'TEST_CODE');
      expect(streamError.name).toBe('StreamError');
      expect(streamError.message).toBe('Test message');
      expect(streamError.code).toBe('TEST_CODE');

      const compatError = new CompatibilityError('test-feature', 'Chrome 90');
      expect(compatError.name).toBe('CompatibilityError');
      expect(compatError.feature).toBe('test-feature');

      const transferError = new TransferError('Transfer failed', '/api/test', 500, 'POST');
      expect(transferError.name).toBe('TransferError');
      expect(transferError.url).toBe('/api/test');
      expect(transferError.statusCode).toBe(500);

      const formatError = new DataFormatError('JSON', 'XML');
      expect(formatError.name).toBe('DataFormatError');
      expect(formatError.expectedFormat).toBe('JSON');
      expect(formatError.actualFormat).toBe('XML');

      const memoryError = new MemoryError('Out of memory', 1000000, 500000);
      expect(memoryError.name).toBe('MemoryError');
      expect(memoryError.memoryUsage).toBe(1000000);
      expect(memoryError.memoryLimit).toBe(500000);
    });
  });

  describe('模块配置验证', () => {
    it('应该使用正确的默认配置', () => {
      resetModule();
      
      return initStreamModule().then(() => {
        const config = getModuleConfig();
        
        expect(config.compatibility?.autoLoadPolyfills).toBe(true);
        expect(config.transfer?.timeout).toBe(30000);
        expect(config.transfer?.retryCount).toBe(3);
        expect(config.transfer?.chunkSize).toBe(1024 * 1024);
        expect(config.stream?.highWaterMark).toBe(16384);
      });
    });

    it('应该支持自定义配置覆盖', () => {
      resetModule();
      
      return initStreamModule({
        transfer: {
          timeout: 60000,
          retryCount: 5,
          chunkSize: 2 * 1024 * 1024
        },
        stream: {
          highWaterMark: 32768
        }
      }).then(() => {
        const config = getModuleConfig();
        
        expect(config.transfer?.timeout).toBe(60000);
        expect(config.transfer?.retryCount).toBe(5);
        expect(config.transfer?.chunkSize).toBe(2 * 1024 * 1024);
        expect(config.stream?.highWaterMark).toBe(32768);
      });
    });
  });
});