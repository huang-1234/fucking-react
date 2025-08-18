/**
 * DOM环境模拟器
 * 使用jsdom在Node.js环境中模拟浏览器DOM/BOM对象
 */
import { JSDOM } from 'jsdom';

/**
 * 创建DOM环境
 * 在Node.js环境中注入浏览器DOM/BOM对象
 */
export function createDOMEnvironment(options: {
  url?: string;
  html?: string;
  referrer?: string;
  contentType?: string;
  userAgent?: string;
} = {}) {
  const {
    url = 'http://localhost',
    html = '<!DOCTYPE html><html><body><div id="root"></div></body></html>',
    referrer = '',
    contentType = 'text/html',
    userAgent = 'node.js'
  } = options;

  // 创建JSDOM实例
  const dom = new JSDOM(html, {
    url,
    referrer,
    contentType,
    userAgent,
    pretendToBeVisual: true, // 启用模拟渲染
    runScripts: 'outside-only' // 不自动执行脚本，但允许手动执行
  });

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
  if (typeof global.window.requestAnimationFrame === 'undefined') {
    global.window.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 0);
    };
    global.window.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }

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

  // React 18+ 需要的一些特定API
  if (!global.window.TextEncoder) {
    global.window.TextEncoder = require('util').TextEncoder;
  }

  if (!global.window.TextDecoder) {
    global.window.TextDecoder = require('util').TextDecoder;
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
export default function createDOM(options = {}) {
  const { cleanup } = createDOMEnvironment(options);
  return cleanup;
}
