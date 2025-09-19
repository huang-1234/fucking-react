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
    private underlyingSource: any;
    private reader: any = null;
    
    constructor(underlyingSource?: any) {
      this.underlyingSource = underlyingSource || {};
      if (this.underlyingSource.start) {
        this.underlyingSource.start({
          enqueue: () => {},
          close: () => {},
          error: () => {}
        });
      }
    }
    
    getReader() {
      if (this.reader) {
        throw new Error('ReadableStream is locked');
      }
      
      let offset = 0;
      let closed = false;
      const chunks: Uint8Array[] = [];
      
      this.reader = {
        read: async () => {
          if (closed) {
            return { done: true, value: undefined };
          }
          
          if (this.underlyingSource.pull) {
            const controller = {
              enqueue: (chunk: any) => {
                chunks.push(chunk);
              },
              close: () => {
                closed = true;
              },
              error: (error: any) => {
                throw error;
              }
            };
            
            this.underlyingSource.pull(controller);
            
            if (chunks.length > 0) {
              return { done: false, value: chunks.shift() };
            }
            
            if (closed) {
              return { done: true, value: undefined };
            }
          }
          
          // 默认行为：返回空数据表示结束
          return { done: true, value: undefined };
        },
        
        releaseLock: () => {
          this.reader = null;
        }
      };
      
      return this.reader;
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

// 设置全局Mock（排除只读属性）
Object.keys(mockGlobal).forEach(key => {
  if (key !== 'crypto') {
    (global as any)[key] = (mockGlobal as any)[key];
  }
});

// 特殊处理crypto对象
if (!global.crypto || !global.crypto.subtle) {
  try {
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          digest: vi.fn().mockImplementation(async (algorithm: string, data: ArrayBuffer | Uint8Array) => {
            // Mock hash implementation
            return new ArrayBuffer(32); // Mock SHA-256 result
          })
        }
      },
      writable: true,
      configurable: true
    });
  } catch (error) {
    // 如果无法设置crypto，则跳过
    console.warn('Cannot mock crypto object:', error);
  }
}

// 浏览器环境Mock模块
export class BrowserMock {
  private static originalGlobals: Record<string, any> = {};

  /**
   * 模拟浏览器DOM环境
   */
  static mockDOM() {
    // Mock document
    const mockDocument = {
      createElement: vi.fn((tagName: string) => {
        const element = {
          tagName: tagName.toUpperCase(),
          style: {},
          setAttribute: vi.fn(),
          getAttribute: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          click: vi.fn(),
          focus: vi.fn(),
          blur: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn(),
          insertBefore: vi.fn(),
          replaceChild: vi.fn(),
          cloneNode: vi.fn(),
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => []),
          getElementsByTagName: vi.fn(() => []),
          getElementsByClassName: vi.fn(() => []),
          getElementsByName: vi.fn(() => []),
          getElementsByTagNameNS: vi.fn(() => []),
          getElementsByClassNameNS: vi.fn(() => []),
          getElementsByNameNS: vi.fn(() => []),
          getElementsByTagNameNSSelector: vi.fn(() => []),
          getElementsByClassNameNSSelector: vi.fn(() => []),
          getElementsByNameNSSelector: vi.fn(() => []),
          getElementsByTagNameNSSelectorAll: vi.fn(() => []),
          getElementsByClassNameNSSelectorAll: vi.fn(() => []),
          getElementsByNameNSSelectorAll: vi.fn(() => []),
          innerHTML: '',
          textContent: '',
          value: '',
          files: null,
          href: '',
          download: ''
        };

        // 特殊处理input元素
        if (tagName.toLowerCase() === 'input') {
          Object.assign(element, {
            type: 'text',
            files: [],
            webkitdirectory: false,
            multiple: false
          });
        }

        // 特殊处理a元素
        if (tagName.toLowerCase() === 'a') {
          Object.assign(element, {
            href: '',
            download: '',
            click: vi.fn()
          });
        }

        return element;
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };

    // Mock window
    const mockWindow = {
      location: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        pathname: '/',
        search: '',
        hash: ''
      },
      navigator: {
        userAgent: 'Mozilla/5.0 (Test Environment)',
        platform: 'Test',
        language: 'en-US',
        languages: ['en-US', 'en'],
        onLine: true,
        cookieEnabled: true
      },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      open: vi.fn(),
      close: vi.fn(),
      postMessage: vi.fn(),
      alert: vi.fn(),
      confirm: vi.fn(() => true),
      prompt: vi.fn(() => 'test'),
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
      setInterval: global.setInterval,
      clearInterval: global.clearInterval,
      requestAnimationFrame: vi.fn((callback) => {
        setTimeout(callback, 16);
        return 1;
      }),
      cancelAnimationFrame: vi.fn(),
      URL: {
        createObjectURL: vi.fn(() => 'blob:http://localhost:3000/test-blob-url'),
        revokeObjectURL: vi.fn()
      }
    };

    // 保存原始值
    this.originalGlobals.document = global.document;
    this.originalGlobals.window = global.window;

    // 设置Mock
    global.document = mockDocument as any;
    global.window = mockWindow as any;

    return { document: mockDocument, window: mockWindow };
  }

  /**
   * 模拟File API
   */
  static mockFileAPI() {
    const mockFileReader = class MockFileReader {
      result: any = null;
      error: any = null;
      readyState: number = 0;
      onload: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onprogress: ((event: any) => void) | null = null;

      readAsText(file: Blob) {
        setTimeout(() => {
          this.readyState = 2;
          this.result = 'mock file content';
          if (this.onload) {
            this.onload({ target: this });
          }
        }, 10);
      }

      readAsArrayBuffer(file: Blob) {
        setTimeout(() => {
          this.readyState = 2;
          this.result = new ArrayBuffer(1024);
          if (this.onload) {
            this.onload({ target: this });
          }
        }, 10);
      }

      readAsDataURL(file: Blob) {
        setTimeout(() => {
          this.readyState = 2;
          this.result = 'data:text/plain;base64,dGVzdA==';
          if (this.onload) {
            this.onload({ target: this });
          }
        }, 10);
      }

      abort() {
        this.readyState = 2;
      }
    };

    this.originalGlobals.FileReader = global.FileReader;
    global.FileReader = mockFileReader as any;

    return mockFileReader;
  }

  /**
   * 模拟WebSocket
   */
  static mockWebSocket() {
    const mockWebSocket = class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;

      url: string;
      readyState: number = 0;
      onopen: ((event: any) => void) | null = null;
      onclose: ((event: any) => void) | null = null;
      onmessage: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;

      constructor(url: string, protocols?: string | string[]) {
        this.url = url;
        setTimeout(() => {
          this.readyState = 1;
          if (this.onopen) {
            this.onopen({ type: 'open' });
          }
        }, 10);
      }

      send(data: any) {
        if (this.readyState !== 1) {
          throw new Error('WebSocket is not open');
        }
        // Mock sending data
      }

      close(code?: number, reason?: string) {
        this.readyState = 3;
        if (this.onclose) {
          this.onclose({ type: 'close', code: code || 1000, reason: reason || '' });
        }
      }

      addEventListener(type: string, listener: any) {
        if (type === 'open') this.onopen = listener;
        if (type === 'close') this.onclose = listener;
        if (type === 'message') this.onmessage = listener;
        if (type === 'error') this.onerror = listener;
      }

      removeEventListener(type: string, listener: any) {
        if (type === 'open') this.onopen = null;
        if (type === 'close') this.onclose = null;
        if (type === 'message') this.onmessage = null;
        if (type === 'error') this.onerror = null;
      }
    };

    this.originalGlobals.WebSocket = global.WebSocket;
    global.WebSocket = mockWebSocket as any;

    return mockWebSocket;
  }

  /**
   * 模拟IndexedDB
   */
  static mockIndexedDB() {
    const mockIDBRequest = {
      result: null as unknown as typeof mockIDBDatabase,
      error: null,
      onsuccess: (target: unknown) => {},
      onerror: null,
      readyState: 'pending'
    };

    const mockIDBObjectStore = {
      name: 'test-store',
      keyPath: 'id',
      indexNames: [],
      add: vi.fn(() => mockIDBRequest),
      put: vi.fn(() => mockIDBRequest),
      get: vi.fn(() => mockIDBRequest),
      delete: vi.fn(() => mockIDBRequest),
      clear: vi.fn(() => mockIDBRequest),
      count: vi.fn(() => mockIDBRequest),
      openCursor: vi.fn(() => mockIDBRequest),
      createIndex: vi.fn(),
      deleteIndex: vi.fn(),
      getAll: vi.fn(),
      getAllKeys: vi.fn(),
      getAllCursor: vi.fn(),
      getKey: vi.fn(),
      countKey: vi.fn(),
      openKeyCursor: vi.fn(() => mockIDBRequest)
    };

    const mockIDBTransaction = {
      objectStore: vi.fn(() => mockIDBObjectStore),
      abort: vi.fn(),
      oncomplete: null,
      onerror: null,
      onabort: null
    };

    const mockIDBDatabase = {
      name: 'test-db',
      version: 1,
      objectStoreNames: [],
      transaction: vi.fn(() => mockIDBTransaction),
      createObjectStore: vi.fn(() => mockIDBObjectStore),
      deleteObjectStore: vi.fn(),
      close: vi.fn()
    };

    const mockIndexedDB = {
      open: vi.fn((name: string, version?: number) => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockIDBDatabase;
          request.readyState = 'done';
          if (typeof request.onsuccess === 'function') {
            request?.onsuccess?.({ target: request });
          }
        }, 10);
        return request;
      }),
      deleteDatabase: vi.fn(() => mockIDBRequest),
      cmp: vi.fn((a: any, b: any) => a < b ? -1 : a > b ? 1 : 0)
    };

    this.originalGlobals.indexedDB = global.indexedDB;
    global.indexedDB = mockIndexedDB as any;

    return {
      indexedDB: mockIndexedDB,
      IDBDatabase: mockIDBDatabase,
      IDBTransaction: mockIDBTransaction,
      IDBObjectStore: mockIDBObjectStore,
      IDBRequest: mockIDBRequest
    };
  }

  /**
   * 模拟Geolocation API
   */
  static mockGeolocation() {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error, options) => {
        setTimeout(() => {
          if (success) {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            });
          }
        }, 10);
      }),
      watchPosition: vi.fn(() => 1),
      clearWatch: vi.fn()
    };

    if (!global.navigator) {
      global.navigator = {} as any;
    }
    this.originalGlobals.geolocation = global.navigator.geolocation;
    (global.navigator as any).geolocation = mockGeolocation;

    return mockGeolocation;
  }

  /**
   * 模拟Notification API
   */
  static mockNotification() {
    const mockNotification = class MockNotification {
      static permission: NotificationPermission = 'granted';

      static requestPermission = vi.fn(async () => 'granted' as NotificationPermission);

      title: string;
      body?: string;
      icon?: string;
      onclick: ((event: Event) => void) | null = null;
      onclose: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onshow: ((event: Event) => void) | null = null;

      constructor(title: string, options?: NotificationOptions) {
        this.title = title;
        this.body = options?.body;
        this.icon = options?.icon;

        setTimeout(() => {
          if (this.onshow) {
            this.onshow(new Event('show'));
          }
        }, 10);
      }

      close() {
        if (this.onclose) {
          this.onclose(new Event('close'));
        }
      }
    };

    this.originalGlobals.Notification = global.Notification;
    global.Notification = mockNotification as any;

    return mockNotification;
  }

  /**
   * 模拟Canvas API
   */
  static mockCanvas() {
    const mockCanvas = {
      width: 300,
      height: 150,
      getContext: vi.fn((type: string) => {
        if (type === '2d') {
          return {
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '10px sans-serif',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            clearRect: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
            measureText: vi.fn(() => ({ width: 50 })),
            beginPath: vi.fn(),
            closePath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            createImageData: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn(),
            toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
          };
        }
        return null;
      }),
      toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
      toBlob: vi.fn((callback) => {
        setTimeout(() => {
          callback(new Blob(['mock canvas data'], { type: 'image/png' }));
        }, 10);
      })
    };

    // Mock document.createElement for canvas
    const originalCreateElement = global.document?.createElement;
    if (global.document) {
      global.document.createElement = vi.fn((tagName: string) => {
        if (tagName.toLowerCase() === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement ? originalCreateElement.call(global.document, tagName) : {};
      });
    }

    return mockCanvas;
  }

  /**
   * 模拟支持的特性
   */
  static mockFeature(featureName: string, implementation: any) {
    // 保存原始值
    if (!this.originalGlobals[featureName]) {
      this.originalGlobals[featureName] = (global as any)[featureName];
    }

    // 设置Mock实现
    (global as any)[featureName] = implementation;

    return implementation;
  }

  /**
   * 模拟不支持的特性
   */
  static mockUnsupportedFeature(featureName: string) {
    // 保存原始值
    if (!this.originalGlobals[featureName]) {
      this.originalGlobals[featureName] = (global as any)[featureName];
    }

    // 删除特性，模拟不支持
    delete (global as any)[featureName];
  }

  /**
   * 检查特性是否被模拟为支持
   */
  static isFeatureMocked(featureName: string): boolean {
    return (global as any)[featureName] !== undefined;
  }

  /**
   * 恢复特定特性
   */
  static restoreFeature(featureName: string) {
    if (this.originalGlobals[featureName] !== undefined) {
      (global as any)[featureName] = this.originalGlobals[featureName];
      delete this.originalGlobals[featureName];
    } else {
      delete (global as any)[featureName];
    }
  }

  /**
   * 恢复所有Mock
   */
  static restoreAll() {
    Object.keys(this.originalGlobals).forEach(key => {
      if (this.originalGlobals[key] !== undefined) {
        (global as any)[key] = this.originalGlobals[key];
      } else {
        delete (global as any)[key];
      }
    });
    this.originalGlobals = {};
  }

  /**
   * 设置完整的浏览器环境Mock
   */
  static setupBrowserEnvironment() {
    this.mockDOM();
    this.mockFileAPI();
    this.mockWebSocket();
    this.mockIndexedDB();
    this.mockGeolocation();
    this.mockNotification();
    this.mockCanvas();

    return {
      restore: () => this.restoreAll()
    };
  }

  /**
   * 创建Mock事件
   */
  static createEvent(type: string, properties: Record<string, any> = {}) {
    return {
      type,
      target: null,
      currentTarget: null,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
      ...properties
    };
  }

  /**
   * 创建Mock文件选择事件
   */
  static createFileSelectEvent(files: File[]) {
    return this.createEvent('change', {
      target: {
        files: files,
        value: files.length > 0 ? files[0].name : ''
      }
    });
  }

  /**
   * 创建Mock拖拽事件
   */
  static createDragEvent(type: string, files: File[] = []) {
    return this.createEvent(type, {
      dataTransfer: {
        files: files,
        items: files.map(file => ({
          kind: 'file',
          type: file.type,
          getAsFile: () => file
        })),
        types: ['Files'],
        dropEffect: 'copy',
        effectAllowed: 'all'
      }
    });
  }
}

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

/**
 * 设置Stream测试环境
 */
export function setupStreamTests() {
  // 在每个测试套件开始前设置浏览器环境
  beforeEach(() => {
    // 设置基础的浏览器环境Mock
    BrowserMock.setupBrowserEnvironment();
  });

  afterEach(() => {
    // 清理Mock环境
    BrowserMock.restoreAll();
  });
}

// 导出所有工具
export {
  TestDataGenerator as TestData,
  MockUtils as Mock,
  AssertUtils as Assert,
  PerformanceUtils as Performance
};