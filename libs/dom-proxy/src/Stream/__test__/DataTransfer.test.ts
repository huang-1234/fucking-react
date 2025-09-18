/**
 * DataTransfer类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataTransfer } from '../core/DataTransfer';
import { BinaryData } from '../core/BinaryData';
import { TransferError } from '../utils/errors';
import { TestDataGenerator, setupStreamTests, MockUtils } from './setup';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DataTransfer', () => {
  setupStreamTests();

  let dataTransfer: DataTransfer;
  let testData: BinaryData;

  beforeEach(() => {
    dataTransfer = new DataTransfer({
      timeout: 5000,
      retryCount: 2,
      chunkSize: 1024,
      debug: true
    });

    testData = BinaryData.from(TestDataGenerator.generateBinaryData(5000));
    
    // 重置fetch mock
    mockFetch.mockReset();
  });

  afterEach(() => {
    dataTransfer.abort();
  });

  describe('构造函数和配置', () => {
    it('应该使用默认配置', () => {
      const defaultTransfer = new DataTransfer();
      expect(defaultTransfer).toBeInstanceOf(DataTransfer);
    });

    it('应该使用自定义配置', () => {
      const customTransfer = new DataTransfer({
        timeout: 10000,
        retryCount: 5,
        chunkSize: 2048
      });
      expect(customTransfer).toBeInstanceOf(DataTransfer);
    });
  });

  describe('分页传输', () => {
    it('应该执行串行分页传输', async () => {
      // Mock成功响应
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, pageIndex: 0 })
      });

      const progressMock = MockUtils.createProgressMock();
      const pageCompleteMock = vi.fn();

      const result = await dataTransfer.paginatedTransfer('/api/upload', testData, {
        pageSize: 1000,
        parallel: false,
        onProgress: progressMock.callback,
        onPageComplete: pageCompleteMock
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5); // 5000 bytes / 1000 = 5 pages
      expect(progressMock.getCallCount()).toBeGreaterThan(0);
      expect(pageCompleteMock).toHaveBeenCalledTimes(5);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('应该执行并行分页传输', async () => {
      // Mock成功响应
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await dataTransfer.paginatedTransfer('/api/upload', testData, {
        pageSize: 1000,
        parallel: true,
        maxConnections: 3
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('应该处理分页传输错误', async () => {
      // Mock失败响应
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await dataTransfer.paginatedTransfer('/api/upload', testData, {
        pageSize: 1000,
        parallel: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.stats.retryCount).toBeGreaterThanOrEqual(0);
    });

    it('应该包含正确的请求头', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await dataTransfer.paginatedTransfer('/api/upload', testData, {
        pageSize: 1000,
        headers: { 'Authorization': 'Bearer token' }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'X-Page-Index': expect.any(String),
            'X-Page-Size': '1000'
          })
        })
      );
    });
  });

  describe('流式传输', () => {
    it('应该执行流式传输', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, uploaded: true })
      });

      const progressMock = MockUtils.createProgressMock();

      const result = await dataTransfer.streamTransfer('/api/stream-upload', testData, {
        chunkSize: 512,
        onProgress: progressMock.callback
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, uploaded: true });
      expect(progressMock.getCallCount()).toBeGreaterThan(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('应该支持压缩流式传输', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512,
        enableCompression: true
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/octet-stream',
            'Transfer-Encoding': 'chunked'
          })
        })
      );
    });

    it('应该处理流式传输错误', async () => {
      mockFetch.mockRejectedValue(new Error('Stream error'));

      const result = await dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('应该支持中止信号', async () => {
      const abortController = new AbortController();
      
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        });
      });

      setTimeout(() => abortController.abort(), 50);

      const result = await dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512,
        signal: abortController.signal
      });

      expect(result.success).toBe(false);
    });
  });

  describe('压缩传输', () => {
    it('应该执行gzip压缩传输', async () => {
      // 跳过如果压缩流不支持
      if (typeof CompressionStream === 'undefined') {
        return;
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, compressed: true })
      });

      const result = await dataTransfer.compressedTransfer('/api/compressed-upload', testData, {
        compressAlgorithm: 'gzip'
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/compressed-upload',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Encoding': 'gzip'
          })
        })
      );
    });

    it('应该处理不支持压缩的环境', async () => {
      // Mock不支持压缩流
      const originalCompressionStream = globalThis.CompressionStream;
      delete (globalThis as any).CompressionStream;

      const result = await dataTransfer.compressedTransfer('/api/upload', testData, {
        compressAlgorithm: 'gzip'
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Compression streams not supported');

      // 恢复
      if (originalCompressionStream) {
        globalThis.CompressionStream = originalCompressionStream;
      }
    });
  });

  describe('断点续传', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      });
    });

    it('应该执行断点续传', async () => {
      // Mock localStorage为空（新上传）
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      // Mock分块上传响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      // Mock最终完成响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, fileId: 'test-file' })
      });

      const progressMock = MockUtils.createProgressMock();
      const interruptMock = vi.fn();
      const resumeMock = vi.fn();

      const result = await dataTransfer.resumableTransfer('/api/resumable-upload', testData, {
        checkPoint: true,
        checkPointKey: 'test-upload',
        onProgress: progressMock.callback,
        onInterrupt: interruptMock,
        onResume: resumeMock
      });

      expect(result.success).toBe(true);
      expect(progressMock.getCallCount()).toBeGreaterThan(0);
      expect(vi.mocked(localStorage.setItem)).toHaveBeenCalled();
      expect(vi.mocked(localStorage.removeItem)).toHaveBeenCalled();
    });

    it('应该恢复中断的上传', async () => {
      // Mock已存在的断点续传状态
      const existingState = {
        fileId: 'test-file',
        uploadedBytes: 2000,
        totalBytes: 5000,
        chunks: [
          { index: 0, start: 0, end: 1024, size: 1024, uploaded: true },
          { index: 1, start: 1024, end: 2048, size: 1024, uploaded: true },
          { index: 2, start: 2048, end: 3072, size: 1024, uploaded: false },
          { index: 3, start: 3072, end: 4096, size: 1024, uploaded: false },
          { index: 4, start: 4096, end: 5000, size: 904, uploaded: false }
        ],
        createdAt: Date.now() - 10000,
        updatedAt: Date.now() - 5000
      };

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(existingState));

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const resumeMock = vi.fn();

      const result = await dataTransfer.resumableTransfer('/api/resumable-upload', testData, {
        checkPoint: true,
        checkPointKey: 'test-upload',
        onResume: resumeMock
      });

      expect(result.success).toBe(true);
      expect(resumeMock).toHaveBeenCalledWith(2000);
      // 应该只上传未完成的分块
      expect(mockFetch).toHaveBeenCalledTimes(4); // 3个未上传分块 + 1个完成请求
    });

    it('应该处理分块上传失败和重试', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      // 第一次失败，第二次成功
      mockFetch
        .mockRejectedValueOnce(new Error('Chunk upload failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({})
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const result = await dataTransfer.resumableTransfer('/api/resumable-upload', testData, {
        checkPoint: true
      });

      expect(result.success).toBe(true);
      expect(result.stats.retryCount).toBeGreaterThan(0);
    });

    it('应该在重试次数耗尽后失败', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      // 所有请求都失败
      mockFetch.mockRejectedValue(new Error('Persistent failure'));

      const interruptMock = vi.fn();

      const result = await dataTransfer.resumableTransfer('/api/resumable-upload', testData, {
        checkPoint: true,
        onInterrupt: interruptMock
      });

      expect(result.success).toBe(false);
      expect(interruptMock).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理HTTP错误', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(TransferError);
      expect((result.error as TransferError).statusCode).toBe(500);
    });

    it('应该处理网络超时', async () => {
      const shortTimeoutTransfer = new DataTransfer({ timeout: 100 });

      mockFetch.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({})
          }), 200);
        });
      });

      const result = await shortTimeoutTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timeout');
    });

    it('应该支持中止传输', async () => {
      mockFetch.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({})
          }), 1000);
        });
      });

      const transferPromise = dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512
      });

      // 中止传输
      setTimeout(() => dataTransfer.abort(), 50);

      const result = await transferPromise;
      expect(result.success).toBe(false);
    });
  });

  describe('统计信息', () => {
    it('应该收集传输统计信息', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await dataTransfer.streamTransfer('/api/upload', testData, {
        chunkSize: 512
      });

      expect(result.stats).toMatchObject({
        startTime: expect.any(Number),
        endTime: expect.any(Number),
        duration: expect.any(Number),
        bytesTransferred: expect.any(Number),
        averageSpeed: expect.any(Number),
        retryCount: expect.any(Number)
      });

      expect(result.stats.endTime).toBeGreaterThan(result.stats.startTime);
      expect(result.stats.duration).toBeGreaterThan(0);
    });
  });
});