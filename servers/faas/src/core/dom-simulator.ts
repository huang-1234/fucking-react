/**
 * DOM环境模拟器
 * 使用jsdom在Node.js环境中模拟浏览器DOM/BOM对象
 * 优化性能和内存使用
 */
import { JSDOM } from 'jsdom';
import { TextEncoder, TextDecoder } from 'util';

// 环境检测
const isServerless = process.env.IS_SERVERLESS === 'true';

/**
 * DOM环境配置选项
 */
export interface DOMEnvironmentOptions {
  url?: string;
  html?: string;
  referrer?: string;
  contentType?: string;
  userAgent?: string;
  features?: {
    FetchAPI?: boolean;
    WebSocket?: boolean;
    requestAnimationFrame?: boolean;
    MutationObserver?: boolean;
    IntersectionObserver?: boolean;
    ResizeObserver?: boolean;
  };
}

/**
 * 创建DOM环境
 * 在Node.js环境中注入浏览器DOM/BOM对象
 */
export function createDOMEnvironment(options: DOMEnvironmentOptions = {}) {
  const {
    url = 'http://localhost',
    html = '<!DOCTYPE html><html><body><div id="root"></div></body></html>',
    referrer = '',
    contentType = 'text/html',
    userAgent = 'node.js',
    features = {
      FetchAPI: true,
      requestAnimationFrame: true,
      MutationObserver: false,
      IntersectionObserver: false,
      ResizeObserver: false,
    }
  } = options;

  // 创建JSDOM实例
  const jsdomOptions: any = {
    url: url || 'http://localhost',
    contentType,
    userAgent,
    pretendToBeVisual: true, // 启用模拟渲染
    runScripts: 'outside-only', // 不自动执行脚本，但允许手动执行
    resources: 'usable', // 允许加载资源
    virtualConsole: new JSDOM.VirtualConsole(), // 使用虚拟控制台避免污染实际控制台
  };

  // 只有在提供了有效的referrer时才添加
  if (referrer && referrer.startsWith('http')) {
    jsdomOptions.referrer = referrer;
  }

  // 在Serverless环境中优化内存使用
  if (isServerless) {
    jsdomOptions.pretendToBeVisual = false; // 禁用视觉渲染以节省内存
  }

  const dom = new JSDOM(html, jsdomOptions);

  // 全局注入DOM/BOM对象
  const { window } = dom;

  // 扩展全局对象
  global.window = window as unknown as Window & typeof globalThis;
  global.document = window.document;
  global.navigator = window.navigator;
  global.location = window.location;
  global.history = window.history;
  global.HTMLElement = window.HTMLElement;
  global.Element = window.Element;
  global.Node = window.Node;
  global.Event = window.Event;

  // 扩展缺失的BOM API
  if (features.requestAnimationFrame && typeof global.window.requestAnimationFrame === 'undefined') {
    global.window.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 0);
    };
    global.window.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }

  // 性能API
  if (typeof global.window.performance === 'undefined') {
    global.window.performance = {
      now: () => Date.now(),
      mark: () => { },
      measure: () => { },
      getEntriesByName: () => [],
      getEntriesByType: () => [],
      clearMarks: () => { },
      clearMeasures: () => { },
      navigation: {} as any,
      timing: {} as any,
      getEntries: () => [],
      toJSON: () => ({})
    } as unknown as Performance;
  }

  // React 19 需要的一些特定API
  if (!global.window.TextEncoder) {
    global.window.TextEncoder = TextEncoder;
  }

  if (!global.window.TextDecoder) {
    global.window.TextDecoder = TextDecoder;
  }

  // 添加 MutationObserver
  if (features.MutationObserver && typeof global.window.MutationObserver === 'undefined') {
    global.window.MutationObserver = class MutationObserver {
      callback: MutationCallback;
      constructor(callback: MutationCallback) {
        this.callback = callback;
      }
      observe() { return; }
      disconnect() { return; }
      takeRecords() { return []; }
    } as any;
  }

  // 添加 IntersectionObserver
  if (features.IntersectionObserver && typeof global.window.IntersectionObserver === 'undefined') {
    global.window.IntersectionObserver = class IntersectionObserver {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe() { return; }
      unobserve() { return; }
      disconnect() { return; }
      takeRecords() { return []; }
    } as any;
  }

  // 添加 ResizeObserver
  if (features.ResizeObserver && typeof global.window.ResizeObserver === 'undefined') {
    global.window.ResizeObserver = class ResizeObserver {
      callback: any;
      constructor(callback: any) {
        this.callback = callback;
      }
      observe() { return; }
      unobserve() { return; }
      disconnect() { return; }
    } as any;
  }

  // 清理函数
  const cleanup = () => {
    window.close();
    delete (global as any).window;
    delete (global as any).document;
    delete (global as any).navigator;
    delete (global as any).location;
    delete (global as any).history;
    delete (global as any).HTMLElement;
    delete (global as any).Element;
    delete (global as any).Node;
    delete (global as any).Event;
  };

  return {
    window,
    document: window.document,
    jsdom: dom,
    cleanup
  };
}

/**
 * 创建DOM环境并返回cleanup函数
 * 简化版API，用于快速创建DOM环境
 */
export default function createDOM(options: DOMEnvironmentOptions = {}) {
  const { cleanup } = createDOMEnvironment(options);
  return cleanup;
}

/**
 * 检测当前环境
 * 用于判断是否在服务器端
 */
export const isServer = typeof window === 'undefined' || !window.document;

/**
 * 检测是否在 Serverless 环境中
 */
export const isServerlessEnv = isServerless;
