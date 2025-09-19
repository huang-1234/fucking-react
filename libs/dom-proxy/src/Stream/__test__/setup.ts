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
      result: null,
      error: null,
      onsuccess: null,
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
      deleteIndex: vi.fn()
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
          if (request.onsuccess) {
            request.onsuccess({ target: request });
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