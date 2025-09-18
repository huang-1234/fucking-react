/**
 * Stream模块性能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  BinaryData,
  DataTransfer,
  StreamOperations,
  initStreamModule
} from '../index';
import { TestDataGenerator, setupStreamTests } from './setup';

describe('Stream模块性能测试', () => {
  setupStreamTests();

  beforeEach(async () => {
    await initStreamModule({
      compatibility: {
        autoLoadPolyfills: false
      }
    });
  });

  describe('BinaryData性能', () => {
    it('应该快速创建大型BinaryData', () => {
      const startTime = performance.now();
      
      // 创建10MB数据
      const largeData = TestDataGenerator.generateBinaryData(10 * 1024 * 1024);
      const binaryData = BinaryData.from(largeData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(binaryData.size).toBe(10 * 1024 * 1024);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该高效执行切片操作', () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(1024 * 1024));
      
      const startTime = performance.now();
      
      // 执行多次切片操作
      for (let i = 0; i < 100; i++) {
        const start = i * 1000;
        const end = start + 1000;
        const slice = data.slice(start, end);
        expect(slice.size).toBe(1000);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 100次切片应该在100ms内完成
    });

    it('应该高效执行连接操作', () => {
      const chunks = Array.from({ length: 100 }, () => 
        BinaryData.from(TestDataGenerator.generateBinaryData(1024))
      );
      
      const startTime = performance.now();
      
      let result = chunks[0];
      for (let i = 1; i < chunks.length; i++) {
        result = result.concat(chunks[i]);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.size).toBe(100 * 1024);
      expect(duration).toBeLessThan(500); // 应该在500ms内完成
    });

    it('应该快速进行Base64编码', () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(1024 * 1024));
      
      const startTime = performance.now();
      const base64 = data.encodeBase64();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(base64.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // 1MB数据编码应该在200ms内完成
    });
  });

  describe('StreamOperations性能', () => {
    it('应该高效处理大型流', async () => {
      const largeData = BinaryData.from(TestDataGenerator.generateBinaryData(5 * 1024 * 1024));
      
      const startTime = performance.now();
      
      // 转换为流并立即转换回来
      const stream = StreamOperations.binaryToStream(largeData, 64 * 1024);
      const result = await StreamOperations.streamToBinary(stream);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.size).toBe(largeData.size);
      expect(result.equals(largeData)).toBe(true);
      expect(duration).toBeLessThan(2000); // 5MB数据处理应该在2秒内完成
    });

    it('应该高效执行流转换', async () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(1024 * 1024));
      const stream = StreamOperations.binaryToStream(data, 16 * 1024);
      
      const startTime = performance.now();
      
      // 创建简单的转换流
      const transform = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(chunk);
        }
      });
      
      const processedStream = stream.pipeThrough(transform);
      const result = await StreamOperations.streamToBinary(processedStream);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.size).toBe(data.size);
      expect(duration).toBeLessThan(1000); // 1MB数据转换应该在1秒内完成
    });

    it('应该支持高并发流处理', async () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(100 * 1024));
      
      const startTime = performance.now();
      
      // 并发处理多个流
      const promises = Array.from({ length: 10 }, async () => {
        const stream = StreamOperations.binaryToStream(data, 8 * 1024);
        return await StreamOperations.streamToBinary(stream);
      });
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.size).toBe(data.size);
      });
      
      expect(duration).toBeLessThan(2000); // 10个并发流应该在2秒内完成
    });
  });

  describe('DataTransfer性能', () => {
    const mockFetch = vi.fn();
    
    beforeEach(() => {
      global.fetch = mockFetch;
      mockFetch.mockReset();
    });

    it('应该高效处理分页传输', async () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(1024 * 1024));
      const transfer = new DataTransfer({
        chunkSize: 64 * 1024
      });
      
      // Mock快速响应
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      const startTime = performance.now();
      
      const result = await transfer.paginatedTransfer('/api/upload', data, {
        pageSize: 128 * 1024,
        parallel: true,
        maxConnections: 5
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // 并行传输应该很快
    });

    it('应该高效处理流式传输', async () => {
      const data = BinaryData.from(TestDataGenerator.generateBinaryData(512 * 1024));
      const transfer = new DataTransfer();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      const startTime = performance.now();
      
      const result = await transfer.streamTransfer('/api/stream', data, {
        chunkSize: 32 * 1024
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500); // 流式传输应该很快
    });
  });

  describe('内存使用优化', () => {
    it('应该避免内存泄漏', async () => {
      // 这个测试检查是否有明显的内存泄漏
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // 创建和销毁大量对象
      for (let i = 0; i < 100; i++) {
        const data = BinaryData.from(TestDataGenerator.generateBinaryData(10 * 1024));
        const stream = StreamOperations.binaryToStream(data, 1024);
        const result = await StreamOperations.streamToBinary(stream);
        
        // 确保对象被使用
        expect(result.size).toBe(data.size);
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // 内存增长应该是合理的（这个测试可能在不同环境中表现不同）
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 不应该增长超过50MB
      }
    });

    it('应该高效处理大量小对象', () => {
      const startTime = performance.now();
      
      // 创建大量小的BinaryData对象
      const objects = Array.from({ length: 1000 }, (_, i) => 
        BinaryData.from(TestDataGenerator.generateBinaryData(100))
      );
      
      // 执行一些操作
      const results = objects.map(obj => obj.size);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(results.every(size => size === 100)).toBe(true);
      expect(duration).toBeLessThan(100); // 应该很快完成
    });
  });

  describe('算法复杂度', () => {
    it('切片操作应该是O(1)复杂度', () => {
      const sizes = [1024, 10240, 102400, 1024000]; // 不同大小的数据
      const times: number[] = [];
      
      sizes.forEach(size => {
        const data = BinaryData.from(TestDataGenerator.generateBinaryData(size));
        
        const startTime = performance.now();
        
        // 执行多次切片操作
        for (let i = 0; i < 100; i++) {
          const slice = data.slice(0, 100);
          expect(slice.size).toBe(100);
        }
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      });
      
      // 时间不应该随数据大小线性增长
      // 最大时间不应该超过最小时间的10倍
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      expect(maxTime / minTime).toBeLessThan(10);
    });

    it('流处理应该有良好的时间复杂度', async () => {
      const sizes = [64 * 1024, 256 * 1024, 1024 * 1024]; // 不同大小的数据
      const times: number[] = [];
      
      for (const size of sizes) {
        const data = BinaryData.from(TestDataGenerator.generateBinaryData(size));
        
        const startTime = performance.now();
        
        const stream = StreamOperations.binaryToStream(data, 16 * 1024);
        const result = await StreamOperations.streamToBinary(stream);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
        
        expect(result.size).toBe(size);
      }
      
      // 时间应该大致与数据大小成正比
      // 检查时间增长是否合理
      expect(times[1] / times[0]).toBeLessThan(10); // 4倍数据不应该超过10倍时间
      expect(times[2] / times[1]).toBeLessThan(10); // 4倍数据不应该超过10倍时间
    });
  });

  describe('并发性能', () => {
    it('应该支持高并发操作', async () => {
      const concurrency = 20;
      const dataSize = 50 * 1024; // 50KB per operation
      
      const startTime = performance.now();
      
      const promises = Array.from({ length: concurrency }, async (_, i) => {
        const data = BinaryData.from(TestDataGenerator.generateBinaryData(dataSize));
        
        // 执行一系列操作
        const slice1 = data.slice(0, dataSize / 2);
        const slice2 = data.slice(dataSize / 2);
        const combined = slice1.concat(slice2);
        
        const stream = StreamOperations.binaryToStream(combined, 8 * 1024);
        const result = await StreamOperations.streamToBinary(stream);
        
        return result;
      });
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(concurrency);
      results.forEach(result => {
        expect(result.size).toBe(dataSize);
      });
      
      // 并发操作应该比串行操作快
      expect(duration).toBeLessThan(concurrency * 100); // 每个操作不应该超过100ms
    });
  });
});