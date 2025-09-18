/**
 * 测试环境设置和工具函数
 */

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
  static generateArrayBuffer(size: number): ArrayBuffer {
    const data = this.generateBinaryData(size);
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  }
}

// Mock函数工具
export class MockUtils {
  /**
   * 创建进度回调Mock
   */
  static createProgressMock() {
    const progressCalls: any[] = [];
    const progressCallback = jest.fn((progress: any) => {
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
    
    const mockFetch = jest.fn(async (url: string, options?: any) => {
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

// 测试环境设置
export class TestEnvironment {
  private static originalFetch: any;
  private static originalConsole: any;

  /**
   * 设置测试环境
   */
  static setup() {
    // 保存原始函数
    this.originalFetch = global.fetch;
    this.originalConsole = { ...console };

    // 设置全局mocks
    this.setupGlobalMocks();
    this.setupConsoleSuppress();
  }

  /**
   * 清理测试环境
   */
  static teardown() {
    // 恢复原始函数
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
    }
    
    Object.assign(console, this.originalConsole);
  }

  /**
   * 设置全局Mock
   */
  private static setupGlobalMocks() {
    // Mock fetch if not available
    if (!global.fetch) {
      global.fetch = jest.fn();
    }

    // Mock performance if not available
    if (!global.performance) {
      global.performance = {
        now: jest.fn(() => Date.now()),
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByName: jest.fn(() => []),
        getEntriesByType: jest.fn(() => []),
        clearMarks: jest.fn(),
        clearMeasures: jest.fn()
      } as any;
    }

    // Mock crypto if not available
    if (!global.crypto) {
      global.crypto = {
        getRandomValues: jest.fn((array: any) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }),
        subtle: {
          digest: jest.fn(async () => new ArrayBuffer(32))
        }
      } as any;
    }
  }

  /**
   * 抑制控制台输出（测试时）
   */
  private static setupConsoleSuppress() {
    if (process.env.NODE_ENV === 'test') {
      console.log = jest.fn();
      console.warn = jest.fn();
      console.error = jest.fn();
      console.info = jest.fn();
    }
  }

  /**
   * 等待异步操作完成
   */
  static async waitForAsync(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待条件满足
   */
  static async waitForCondition(condition: () => boolean, timeout = 5000, interval = 100) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (condition()) {
        return true;
      }
      await this.waitForAsync(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

// 断言工具
export class AssertionUtils {
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
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
}

// 导出所有工具
export {
  TestDataGenerator as TestData,
  MockUtils as Mock,
  TestEnvironment as Environment,
  AssertionUtils as Assert,
  PerformanceUtils as Performance
};