/**
 * Vitest全局设置文件
 */

import { vi } from 'vitest';

// 设置全局测试环境
export function setupGlobalTestEnvironment() {
  // 模拟浏览器全局对象
  if (typeof window === 'undefined') {
    global.window = {} as any;
  }

  // 模拟文档对象
  if (typeof document === 'undefined') {
    global.document = {} as any;
  }

  // 模拟导航对象
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'vitest',
    } as any;
  }

  // 模拟localStorage
  if (!global.localStorage) {
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
  }

  // 模拟sessionStorage
  if (!global.sessionStorage) {
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
  }

  // 模拟fetch API
  if (typeof global.fetch === 'undefined') {
    global.fetch = vi.fn();
  }

  // 模拟Blob API
  if (typeof global.Blob === 'undefined') {
    global.Blob = class MockBlob {
      size: number;
      type: string;

      constructor(parts: any[], options?: any) {
        this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0);
        this.type = options?.type || '';
      }

      arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(this.size));
      }

      text() {
        return Promise.resolve('');
      }

      slice() {
        return new MockBlob([], { type: this.type });
      }
    } as any;
  } else {
    // 确保Blob.prototype.arrayBuffer存在
    if (!global.Blob.prototype.arrayBuffer) {
      global.Blob.prototype.arrayBuffer = function() {
        return Promise.resolve(new ArrayBuffer(this.size));
      };
    }
  }

  // 模拟File API
  if (typeof global.File === 'undefined') {
    global.File = class MockFile extends (global.Blob as any) {
      name: string;
      lastModified: number;

      constructor(parts: any[], name: string, options?: any) {
        super(parts, options);
        this.name = name;
        this.lastModified = options?.lastModified || Date.now();
      }
    } as any;
  }

  // 模拟URL API
  if (typeof global.URL === 'undefined' || typeof global.URL.createObjectURL === 'undefined') {
    global.URL = {
      ...global.URL,
      createObjectURL: vi.fn(() => 'mock://object-url'),
      revokeObjectURL: vi.fn()
    } as any;
  }

  // 模拟Web Streams API
  if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = class MockReadableStream {
      constructor(source?: any) {
        if (source && source.start) {
          try {
            source.start({
              enqueue: () => {},
              close: () => {},
              error: () => {}
            });
          } catch (e) {
            // 忽略错误
          }
        }
      }
      getReader() {
        return {
          read: () => Promise.resolve({ done: true, value: undefined }),
          releaseLock: () => {}
        };
      }
      pipeThrough(transform: any) {
        return this;
      }
      pipeTo() {
        return Promise.resolve();
      }
    } as any;
  }

  if (typeof global.WritableStream === 'undefined') {
    global.WritableStream = class MockWritableStream {
      constructor(sink?: any) {
        if (sink && sink.start) {
          try {
            sink.start({
              error: () => {}
            });
          } catch (e) {
            // 忽略错误
          }
        }
      }
      getWriter() {
        return {
          write: () => Promise.resolve(),
          close: () => Promise.resolve(),
          abort: () => Promise.resolve(),
          releaseLock: () => {}
        };
      }
    } as any;
  }

  if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = class MockTransformStream {
      readable: any;
      writable: any;

      constructor(transformer?: any) {
        this.readable = new (global.ReadableStream as any)();
        this.writable = new (global.WritableStream as any)();

        if (transformer && transformer.start) {
          try {
            transformer.start({
              enqueue: () => {},
              error: () => {}
            });
          } catch (e) {
            // 忽略错误
          }
        }
      }
    } as any;
  }

  // 模拟TextEncoder/TextDecoder
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = class MockTextEncoder {
      encode(input?: string) {
        return new Uint8Array(input ? input.length : 0);
      }
    } as any;
  }

  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = class MockTextDecoder {
      decode(input?: BufferSource) {
        return '';
      }
    } as any;
  }

  // 模拟Web Crypto API
  if (typeof global.crypto === 'undefined' || !global.crypto.subtle) {
    global.crypto = {
      ...global.crypto,
      subtle: {
        digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
      },
      getRandomValues: vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      })
    } as any;
  }

  // 模拟performance API
  if (typeof global.performance === 'undefined') {
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn()
    } as any;
  }
}

// 执行全局设置
setupGlobalTestEnvironment();
