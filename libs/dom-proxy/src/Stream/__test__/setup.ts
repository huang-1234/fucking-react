import { vi, beforeEach, afterEach, expect } from 'vitest';
import { BinaryData } from '../core/BinaryData';

/**
 * 测试工具函数和Mock设置
 */

// Mock全局对象
const mockGlobal = {
  TextEncoder: class MockTextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  },

  TextDecoder: class MockTextDecoder {
    decode(input: ArrayBuffer | Uint8Array): string {
      if (input instanceof Uint8Array) {
        return Buffer.from(input).toString('utf8');
      }
      return Buffer.from(input).toString('utf8');
    }
  },

  ReadableStream: class MockReadableStream {
    constructor(source?: any) {
      // Mock implementation
    }
  },

  WritableStream: class MockWritableStream {
    constructor(sink?: any) {
      // Mock implementation
    }
  },

  TransformStream: class MockTransformStream {
    constructor(transformer?: any) {
      // Mock implementation
    }
  },

  crypto: {
    subtle: {
      digest: vi.fn().mockImplementation(async (algorithm: string, data: ArrayBuffer | Uint8Array) => {
        // Mock hash implementation
        return new ArrayBuffer(32); // Mock SHA-256 result
      })
    }
  },

  fetch: vi.fn(),

  Response: class MockResponse {
    constructor(body?: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    body: any;
    status: number;
    headers: Map<string, string>;

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return String(this.body);
    }

    async arrayBuffer() {
      if (this.body instanceof ArrayBuffer) {
        return this.body;
      }
      return new ArrayBuffer(0);
    }
  }
};

// 设置全局Mock
Object.assign(global, mockGlobal);

/**
 * 创建Mock进度回调
 */
export function createMockProgressCallback() {
  return vi.fn((progress: { loaded: number; total: number; percentage: number }) => {
    console.log('Progress:', progress);
  });
}

/**
 * 创建Mock ArrayBuffer
 */
export function createMockArrayBuffer(size: number = 1024): ArrayBuffer {
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    view[i] = i % 256;
  }
  return buffer;
}

/**
 * 创建Mock Blob
 */
export function createMockBlob(data: string = 'test data', type: string = 'text/plain'): Blob {
  return new Blob([data], { type });
}

/**
 * 创建Mock File
 */
export function createMockFile(
  data: string = 'test file content',
  name: string = 'test.txt',
  type: string = 'text/plain'
): File {
  return new File([data], name, { type });
}

/**
 * 创建Mock ReadableStream
 */
export function createMockReadableStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  let index = 0;

  return new ReadableStream({
    start(controller) {
      // Stream started
    },
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++]);
      } else {
        controller.close();
      }
    }
  });
}

/**
 * 创建Mock WritableStream
 */
export function createMockWritableStream(): WritableStream<Uint8Array> {
  const chunks: Uint8Array[] = [];

  return new WritableStream({
    write(chunk) {
      chunks.push(chunk);
    },
    close() {
      console.log('Stream closed, received chunks:', chunks.length);
    }
  });
}

/**
 * 创建Mock TransformStream
 */
export function createMockTransformStream(): TransformStream<Uint8Array, Uint8Array> {
  return new TransformStream({
    transform(chunk, controller) {
      // 简单的转换：将数据原样传递
      controller.enqueue(chunk);
    }
  });
}

/**
 * 创建Mock HTTP Response
 */
export function createMockResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

// 测试数据生成工具
export class TestDataGenerator {
  /**
   * 生成随机二进制数据
   */
  static generateBinaryData(size: number): Uint8Array {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    return data;
  }

  /**
   * 生成测试文本
   */
  static generateText(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成测试Blob
   */
  static generateBlob(size: number, type = 'application/octet-stream'): Blob {
    const data = this.generateBinaryData(size);
    return new Blob([data], { type });
  }

  /**
   * 生成测试File
   */
  static generateFile(size: number, name = 'test.bin', type = 'application/octet-stream'): File {
    const data = this.generateBinaryData(size);
    return new File([data], name, { type });
  }

  /**
   * 生成测试ArrayBuffer
   */
  static generateArrayBuffer(size: number) {
    const data = this.generateBinaryData(size);
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }
}

// Mock函数工具
export class MockUtils {
  /**
   * 创建进度回调Mock
   */
  static createProgressMock() {
    const progressCalls: any[] = [];
    const progressCallback = vi.fn((progress: any) => {
      progressCalls.push(progress);
    });

    return {
      callback: progressCallback,
      calls: progressCalls,
      getLastCall: () => progressCalls[progressCalls.length - 1],
      getCallCount: () => progressCalls.length,
      reset: () => {
        progressCalls.length = 0;
        progressCallback.mockClear();
      }
    };
  }

  /**
   * 创建网络请求Mock
   */
  static createFetchMock(responses: any[] = []) {
    let callIndex = 0;

    const mockFetch = vi.fn(async (url: string, options?: any) => {
      const response = responses[callIndex] || { ok: true, status: 200, data: 'success' };
      callIndex++;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText || 'OK',
        headers: new Headers(response.headers || {}),
        json: async () => response.data,
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        arrayBuffer: async () => response.data instanceof ArrayBuffer ? response.data : new ArrayBuffer(0),
        blob: async () => new Blob([response.data || '']),
        body: response.body || null
      };
    });

    return {
      mock: mockFetch,
      reset: () => {
        callIndex = 0;
        mockFetch.mockClear();
      },
      setResponses: (newResponses: any[]) => {
        responses.splice(0, responses.length, ...newResponses);
        callIndex = 0;
      }
    };
  }

  /**
   * 创建ReadableStream Mock
   */
  static createReadableStreamMock(chunks: Uint8Array[]) {
    let index = 0;

    return new ReadableStream({
      start(controller) {
        // 开始时不做任何事
      },
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(chunks[index]);
          index++;
        } else {
          controller.close();
        }
      },
      cancel() {
        index = chunks.length; // 停止流
      }
    });
  }
}

/**
 * 测试环境设置
 */
beforeEach(() => {
  // 重置所有Mock
  vi.clearAllMocks();

  // 重置fetch Mock
  global.fetch = vi.fn();
});

afterEach(() => {
  // 清理测试环境
  vi.restoreAllMocks();
});

/**
 * 测试工具函数
 */
export const testUtils = {
  // 等待异步操作完成
  async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!condition()) {
      throw new Error('Timeout waiting for condition');
    }
  },

  // 模拟延迟
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 断言函数
  expectToBeArrayBuffer: (value: any) => {
    expect(value).toBeInstanceOf(ArrayBuffer);
  },

  expectToBeUint8Array: (value: any) => {
    expect(value).toBeInstanceOf(Uint8Array);
  },

  expectToBeBlob: (value: any) => {
    expect(value).toBeInstanceOf(Blob);
  },

  expectToBeReadableStream: (value: any) => {
    expect(value).toBeInstanceOf(ReadableStream);
  }
};

// 断言工具
export class AssertUtils {
  /**
   * 断言ArrayBuffer相等
   */
  static expectArrayBuffersEqual(actual: ArrayBuffer, expected: ArrayBuffer) {
    expect(actual.byteLength).toBe(expected.byteLength);

    const actualView = new Uint8Array(actual);
    const expectedView = new Uint8Array(expected);

    for (let i = 0; i < actualView.length; i++) {
      expect(actualView[i]).toBe(expectedView[i]);
    }
  }
  /**
   * @desc assertBinaryDataEqual
   */
  static assertBinaryDataEqual(actual: ArrayBuffer, expected: ArrayBuffer) {
    AssertUtils.expectArrayBuffersEqual(actual, expected);
  }

  /**
   * 断言Uint8Array相等
   */
  static expectUint8ArraysEqual(actual: Uint8Array, expected: Uint8Array) {
    expect(actual.length).toBe(expected.length);

    for (let i = 0; i < actual.length; i++) {
      expect(actual[i]).toBe(expected[i]);
    }
  }

  /**
   * 断言进度回调被正确调用
   */
  static expectProgressCalls(progressMock: any, expectedCalls: number) {
    expect(progressMock.getCallCount()).toBe(expectedCalls);

    // 验证进度是递增的
    const calls = progressMock.calls;
    for (let i = 1; i < calls.length; i++) {
      expect(calls[i].percentage).toBeGreaterThanOrEqual(calls[i - 1].percentage);
    }
  }
}

// 性能测试工具
export class PerformanceUtils {
  /**
   * 测量函数执行时间
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    return { result, duration };
  }

  /**
   * 测量内存使用
   */
  static measureMemory(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}
export function setupStreamTests() {

}

// 导出所有工具
export {
  TestDataGenerator as TestData,
  MockUtils as Mock,
  AssertUtils as Assert,
  PerformanceUtils as Performance
};