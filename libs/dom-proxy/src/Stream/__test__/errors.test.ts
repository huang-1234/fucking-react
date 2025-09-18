/**
 * Stream模块错误处理测试
 */

import { describe, it, expect, vi } from 'vitest';
import {
  StreamError,
  CompatibilityError,
  TransferError,
  DataFormatError,
  MemoryError,
  ErrorHandler
} from '../utils/errors';
import { setupStreamTests } from './setup';

describe('Stream错误处理', () => {
  setupStreamTests();

  describe('基础错误类', () => {
    it('应该正确创建StreamError', () => {
      const error = new StreamError('测试错误', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StreamError);
      expect(error.name).toBe('StreamError');
      expect(error.message).toBe('测试错误');
      expect(error.code).toBe('TEST_CODE');
      expect(error.timestamp).toBeGreaterThan(0);
    });

    it('应该支持错误原因', () => {
      const cause = new Error('原始错误');
      const error = new StreamError('包装错误', 'WRAPPED_ERROR', cause);

      expect(error.cause).toBe(cause);
    });

    it('应该支持JSON序列化', () => {
      const error = new StreamError('可序列化错误', 'JSON_ERROR');
      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'StreamError');
      expect(json).toHaveProperty('message', '可序列化错误');
      expect(json).toHaveProperty('code', 'JSON_ERROR');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('stack');
    });
  });

  describe('兼容性错误', () => {
    it('应该正确创建CompatibilityError', () => {
      const error = new CompatibilityError('ReadableStream', 'Chrome 60');

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(CompatibilityError);
      expect(error.name).toBe('CompatibilityError');
      expect(error.feature).toBe('ReadableStream');
      expect(error.browserInfo).toBe('Chrome 60');
      expect(error.code).toBe('COMPATIBILITY_ERROR');
      expect(error.message).toContain('ReadableStream');
      expect(error.message).toContain('Chrome 60');
    });

    it('应该支持不带浏览器信息的兼容性错误', () => {
      const error = new CompatibilityError('TextEncoder');

      expect(error.feature).toBe('TextEncoder');
      expect(error.browserInfo).toBeUndefined();
      expect(error.message).toContain('TextEncoder');
      expect(error.message).not.toContain('(');
    });
  });

  describe('传输错误', () => {
    it('应该正确创建TransferError', () => {
      const error = new TransferError(
        '传输失败',
        '/api/upload',
        500,
        'POST'
      );

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(TransferError);
      expect(error.name).toBe('TransferError');
      expect(error.url).toBe('/api/upload');
      expect(error.statusCode).toBe(500);
      expect(error.method).toBe('POST');
      expect(error.code).toBe('TRANSFER_ERROR');
    });

    it('应该支持不带状态码的传输错误', () => {
      const error = new TransferError('网络错误', '/api/download');

      expect(error.url).toBe('/api/download');
      expect(error.statusCode).toBeUndefined();
      expect(error.method).toBeUndefined();
    });
  });

  describe('数据格式错误', () => {
    it('应该正确创建DataFormatError', () => {
      const error = new DataFormatError('JSON', 'XML');

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(DataFormatError);
      expect(error.name).toBe('DataFormatError');
      expect(error.expectedFormat).toBe('JSON');
      expect(error.actualFormat).toBe('XML');
      expect(error.code).toBe('DATA_FORMAT_ERROR');
      expect(error.message).toContain('JSON');
      expect(error.message).toContain('XML');
    });
  });

  describe('内存错误', () => {
    it('应该正确创建MemoryError', () => {
      const error = new MemoryError(
        '内存不足',
        1024 * 1024 * 100, // 100MB
        1024 * 1024 * 50   // 50MB
      );

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(MemoryError);
      expect(error.name).toBe('MemoryError');
      expect(error.memoryUsage).toBe(1024 * 1024 * 100);
      expect(error.memoryLimit).toBe(1024 * 1024 * 50);
      expect(error.code).toBe('MEMORY_ERROR');
    });

    it('应该支持不带内存使用信息的内存错误', () => {
      const error = new MemoryError('内存分配失败');

      expect(error.memoryUsage).toBeUndefined();
      expect(error.memoryLimit).toBeUndefined();
    });
  });

  describe('错误处理器', () => {
    it('应该处理兼容性错误', () => {
      const error = new CompatibilityError('ReadableStream', 'IE 11');
      const context = { operation: 'streamCreation' };

      const result = ErrorHandler.handle(error, context);

      expect(result.canRecover).toBe(true);
      expect(result.fallbackStrategy).toBe('polyfill');
      expect(result.userMessage).toContain('ReadableStream');
    });

    it('应该处理传输错误', () => {
      const error = new TransferError('服务器错误', '/api/upload', 500, 'POST');
      const context = { operation: 'fileUpload' };

      const result = ErrorHandler.handle(error, context);

      expect(result.canRecover).toBe(true);
      expect(result.userMessage).toContain('500');
      expect(result.retryConfig).toBeDefined();
      expect(result.retryConfig?.maxRetries).toBeGreaterThan(0);
    });

    it('应该处理数据格式错误', () => {
      const error = new DataFormatError('JSON', 'Plain Text');
      const context = { operation: 'dataParsing' };

      const result = ErrorHandler.handle(error, context);

      expect(result.canRecover).toBe(false);
      expect(result.userMessage).toContain('JSON');
      expect(result.userMessage).toContain('Plain Text');
    });

    it('应该处理内存错误', () => {
      const error = new MemoryError('内存不足', 1024 * 1024 * 100);
      const context = { operation: 'largeFileProcessing' };

      const result = ErrorHandler.handle(error, context);

      expect(result.canRecover).toBe(true);
      expect(result.fallbackStrategy).toBe('chunk_processing');
      expect(result.userMessage).toContain('内存不足');
    });

    it('应该处理通用错误', () => {
      const error = new Error('未知错误');
      const context = { operation: 'unknown' };

      const result = ErrorHandler.handle(error, context);

      expect(result.canRecover).toBe(false);
      expect(result.userMessage).toBeDefined();
    });

    it('应该提供用户友好的错误消息', () => {
      const transferError = new TransferError('HTTP 500', '/api/test', 500);
      const message = ErrorHandler.getUserFriendlyMessage(transferError);

      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });

    it('应该记录错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = new StreamError('测试错误', 'TEST_ERROR');
      const context = { operation: 'testing' };

      ErrorHandler.logError(error, context);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[StreamError]',
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'StreamError',
            message: '测试错误',
            code: 'TEST_ERROR'
          }),
          context: context,
          timestamp: expect.any(Number)
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
