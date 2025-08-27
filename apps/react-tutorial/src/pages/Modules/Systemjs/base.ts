/**
 * 基于SystemJS的通用模块加载器
 * 支持AMD、CJS、ESM、UMD、IIFE多种模块格式
 */

import { fakeWindow } from "../Global/base";
import { consoleColor } from "../Tools/console";

/**
 * 模块类型枚举
 */
export enum ModuleType {
  AMD = 'amd',
  CJS = 'cjs',
  ESM = 'esm',
  UMD = 'umd',
  IIFE = 'iife',
}

/**
 * 通过代码特征识别模块类型
 * @param code 模块代码
 * @returns 模块类型
 */
export const detectModuleType = (code: string): ModuleType => {
  if (/\bexport\s+(default\b|\{|\*|const\s+|let\s+|var\s+|function\s+|class\s+)|import\s+/.test(code))
    return ModuleType.ESM;
  if (/define\(.*?function\s*\(/.test(code))
    return ModuleType.AMD;
  if (/\(function\s*\([^)]*\broot\b[^)]*,\s*\bfactory\b[^)]*\)/.test(code))
    return ModuleType.UMD;
  if (/exports.*?\=|\bmodule\.exports\b/.test(code))
    return ModuleType.CJS;
  return ModuleType.IIFE;
};

// 沙箱上下文接口
export interface SandboxContext {
  require: (path: string) => any;
  exports: any;
  module: { exports: any };
  define: (deps: string[] | Function, factory?: Function) => any;
  console: any;
  setTimeout: (callback: () => void, timeout: number) => number;
  clearTimeout: (id: number) => void;
  window?: any;
  global?: any;
  self?: any;
}

/**
 * 自定义的require函数
 * 用于CJS模块加载依赖
 */
const customRequire = (path: string) => {
  console.log(`[SystemJS Sandbox] 请求加载模块: ${path}`);
  return {};
};

/**
 * 创建沙箱环境
 * @returns 沙箱上下文对象
 */
export const createSandbox = (): SandboxContext => {
  // 创建模块上下文
  const context: SandboxContext = {
    require: customRequire,
    exports: {},
    module: { exports: {} },
    define: () => { }, // 将在执行器中定义
    console: {
      log: (...args: any[]) => console.log('[SystemJS Sandbox]', ...args),
      warn: (...args: any[]) => console.warn('[SystemJS Sandbox]', ...args),
      error: (...args: any[]) => console.error('[SystemJS Sandbox]', ...args),
    },
    setTimeout: setTimeout.bind(fakeWindow),
    clearTimeout: clearTimeout.bind(fakeWindow),
  };

  // 设置循环引用
  context.window = context;
  context.global = context;
  context.self = context;

  // 使用Proxy进行安全访问控制
  return new Proxy(context, {
    get(target, key: string | symbol) {
      // 允许访问预定义的安全属性
      if (key in target) {
        return target[key as keyof typeof target];
      }

      // 阻止访问全局对象
      if (key === 'document' || key === 'localStorage' || key === 'location') {
        console.warn(`[SystemJS Sandbox] 阻止访问全局对象: ${String(key)}`);
        return {};
      }

      // 默认返回undefined
      return undefined;
    },
    set(target, key, value) {
      if (key === 'module' || key === 'exports') {
        // 允许修改module.exports的内容
        if (typeof value === 'object') {
          Object.assign(target[key as keyof typeof target], value);
        } else {
          target.module.exports = value;
          target.exports = value;
        }
        return true;
      } else if (key === 'require' || key === 'define') {
        target[key as keyof typeof target] = value;
        return true;
      }

      // 允许设置其他属性，但发出警告
      console.warn(`[SystemJS Sandbox] 设置属性: ${String(key)}`);
      (target as any)[key] = value;
      return true;
    }
  });
};

/**
 * SystemJS模块加载器核心类
 */
export class SystemJSLoader {
  // 模块缓存
  private moduleCache = new Map<string, any>();
  // 正在加载的模块
  private loadingModules = new Set<string>();
  // 最大依赖深度
  private readonly MAX_DEPTH = 20;
  // SystemJS实例
  private systemInstance: any;

  constructor() {
    // 初始化SystemJS
    this.initializeSystem();
  }

  /**
   * 初始化SystemJS实例
   * 在浏览器环境中使用全局System，在测试环境中模拟System
   */
  private initializeSystem() {
    // 检查是否在浏览器环境中
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

    if (isBrowser && typeof (window as any).System !== 'undefined') {
      this.systemInstance = (window as any).System;
    } else {
      // 在非浏览器环境中模拟SystemJS
      this.systemInstance = this.createMockSystem();
    }

    // 配置SystemJS
    this.configureSystem();
  }

  /**
   * 创建模拟的SystemJS实例（用于测试环境）
   */
  private createMockSystem() {
    return {
      import: async (url: string) => {
        console.log(`[Mock SystemJS] 加载模块: ${url}`);
        // 模拟模块加载
        return {};
      },
      register: () => {},
      config: () => {},
      delete: () => {},
      getRegister: () => new Map(),
      set: () => {},
      get: () => {},
      has: () => false,
    };
  }

  /**
   * 配置SystemJS基础设置
   */
  private configureSystem() {
    this.systemInstance.config({
      // 设置默认模块解析规则
      packages: {
        '*': {
          defaultExtension: 'js',
          format: 'detect', // 自动检测模块格式
        }
      },
      // 允许加载外部资源
      meta: {
        '*': { authorization: true }
      }
    });
  }

  /**
   * 加载模块（核心方法）
   * @param code 模块代码
   * @param moduleId 模块标识符
   * @param format 显式指定模块格式
   * @returns Promise，解析为模块导出
   */
  public async loadModule(
    code: string,
    moduleId?: string,
    format?: ModuleType
  ): Promise<any> {
    // 缓存检查
    if (moduleId && this.moduleCache.has(moduleId)) {
      return this.moduleCache.get(moduleId);
    }

    // 循环依赖检测
    this.checkCircularDependency(moduleId);

    try {
      // 创建Blob URL
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      // 显式设置模块格式
      if (format) {
        this.setModuleFormat(url, format);
      }

      // 加载模块
      const moduleExports = await this.importModule(url);

      // 创建安全代理
      const safeExports = this.createSafeExports(moduleExports);

      // 缓存处理
      if (moduleId) {
        this.moduleCache.set(moduleId, safeExports);
      }

      // 清理Blob URL
      URL.revokeObjectURL(url);

      return safeExports;
    } finally {
      if (moduleId) {
        this.loadingModules.delete(moduleId);
      }
    }
  }

  /**
   * 导入模块
   * @param url 模块URL
   * @returns Promise，解析为模块导出
   */
  public async importModule(url: string): Promise<any> {
    try {
      return await this.systemInstance.import(url);
    } catch (error) {
      consoleColor.logGroup( `模块加载失败: ${url}`, () => {
        console.error(error);
      });
      throw error;
    }
  }

  /**
   * 设置模块格式
   * @param url 模块URL
   * @param format 模块格式
   */
  private setModuleFormat(url: string, format: ModuleType) {
    const systemFormatMap = {
      [ModuleType.AMD]: 'amd',
      [ModuleType.CJS]: 'cjs',
      [ModuleType.ESM]: 'esm',
      [ModuleType.UMD]: 'umd',
      [ModuleType.IIFE]: 'global'
    };

    this.systemInstance.config({
      meta: {
        [url]: { format: systemFormatMap[format] }
      }
    });
  }

  /**
   * 创建安全的导出对象
   * @param exports 模块导出
   * @returns 安全的模块导出代理
   */
  private createSafeExports(exports: any): any {
    // 确保exports是一个对象
    if (!exports || typeof exports !== 'object') {
      exports = { default: exports };
    }

    return new Proxy(exports, {
      get: (target, prop) => {
        const value = target[prop];

        // 函数绑定安全上下文
        if (typeof value === 'function') {
          return value.bind(this.createSafeContext());
        }

        // 防止原型链污染
        if (prop === '__proto__' || prop === 'constructor') {
          return undefined;
        }

        // 深拷贝对象，避免污染
        if (typeof value === 'object' && value !== null) {
          try {
            return structuredClone(value);
          } catch (e) {
            // 如果不支持structuredClone，使用JSON深拷贝
            return JSON.parse(JSON.stringify(value));
          }
        }

        return value;
      },
      set: () => false // 禁止修改导出对象
    });
  }

  /**
   * 创建安全上下文
   * @returns 安全的上下文对象
   */
  private createSafeContext() {
    return new Proxy(createSandbox(), {
      get: (target, prop) => {
        // 阻止访问危险API
        const blocked = ['eval', 'Function', 'document', 'localStorage'];
        if (blocked.includes(prop as string)) {
          throw new Error(`访问受限API: ${String(prop)}`);
        }
        return target[prop as keyof SandboxContext];
      }
    });
  }

  /**
   * 循环依赖检查
   * @param moduleId 模块ID
   */
  public checkCircularDependency(moduleId?: string) {
    if (!moduleId) return;

    if (this.loadingModules.has(moduleId)) {
      throw new Error(`检测到循环依赖: ${moduleId}`);
    }

    if (this.loadingModules.size >= this.MAX_DEPTH) {
      throw new Error(`超过最大依赖深度 (${this.MAX_DEPTH})`);
    }

    this.loadingModules.add(moduleId);
  }

  /**
   * 添加远程映射
   * @param map 映射对象
   */
  public addImportMap(map: Record<string, string>) {
    this.systemInstance.config({
      map: Object.entries(map).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>)
    });
  }

  /**
   * 卸载模块
   * @param moduleId 模块ID
   * @returns 是否成功卸载
   */
  public unloadModule(moduleId: string): boolean {
    if (this.moduleCache.has(moduleId)) {
      // 从SystemJS注册表中删除
      this.systemInstance.delete(moduleId);
      return this.moduleCache.delete(moduleId);
    }
    return false;
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.moduleCache.clear();
    // 尝试清除SystemJS所有模块缓存
    try {
      const register = this.systemInstance.getRegister();
      if (register && typeof register.forEach === 'function') {
        register.forEach((_: any, id: string) => {
          this.systemInstance.delete(id);
        });
      }
    } catch (e) {
      console.warn('[SystemJS] 清除注册表失败:', e);
    }
  }

  /**
   * 获取SystemJS实例
   * 仅供ModuleDashboard使用
   */
  public getSystemInstance() {
    return this.systemInstance;
  }
}

// 单例加载器实例
export const systemJSLoader = new SystemJSLoader();

/**
 * 安全加载模块（公共API）
 * @param code 模块代码
 * @param moduleId 模块标识符
 * @returns Promise，解析为模块导出
 */
export const safeLoadModule = async (
  code: string,
  moduleId?: string
): Promise<any> => {
  // 恶意代码检测
  if (containsMaliciousCode(code)) {
    throw new Error('检测到潜在的恶意代码');
  }

  // 自动检测模块格式
  const format = detectModuleType(code);

  try {
    return await systemJSLoader.loadModule(code, moduleId, format);
  } catch (error) {
    consoleColor.logGroup( '[SystemJS] 模块加载失败:', () => {
      console.error(error);
    });
    throw error;
  }
};

/**
 * 从URL加载模块
 * @param url 模块URL
 * @param moduleId 模块标识符
 * @returns Promise，解析为模块导出
 */
export const loadModuleFromUrl = async (
  url: string,
  moduleId?: string
): Promise<any> => {
  try {
    // 获取模块代码
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}: ${response.statusText}`);
    }

    const code = await response.text();
    return await safeLoadModule(code, moduleId || url);
  } catch (error) {
    consoleColor.logGroup(`[SystemJS] 从URL加载模块失败: ${url}`, () => {
      console.error(error);
    });
    throw error;
  }
};

/**
 * 检测恶意代码
 * @param code 要检查的代码
 * @returns 是否包含恶意代码
 */
export const containsMaliciousCode = (code: string): boolean => {
  // 检测常见的恶意代码模式
  const maliciousPatterns = [
    /\beval\s*\(/,                    // eval()
    /new\s+Function\s*\(/,            // new Function()
    /\bdocument\.cookie\b/,           // document.cookie
    /\blocation\s*=/,                 // location=
    /\bwindow\s*\.\s*open\s*\(/,      // window.open()
    /\bnavigator\s*\.\s*userAgent\b/, // navigator.userAgent
  ];

  return maliciousPatterns.some(pattern => pattern.test(code));
};

// 导出模块示例
export const moduleExamples = {
  amd: `
    define(['jquery', 'lodash'], function($, _) {
      function renderTemplate(template, data) {
        const compiled = _.template(template);
        return compiled(data);
      }

      return {
        name: 'amd-module',
        renderTemplate: renderTemplate
      };
    });
  `,
  cjs: `
    const path = require('path');

    function joinPath(parts) {
      return path.join.apply(path, parts);
    }

    module.exports = {
      name: 'cjs-module',
      joinPath: joinPath
    };
  `,
  esm: `
    const data = { version: '1.0.0' };

    export function getData() {
      return { ...data };
    }

    export default {
      name: 'esm-module',
      getData
    };
  `,
  umd: `
    (function(root, factory) {
      if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
      } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
      } else {
        // 浏览器全局变量
        root.Calculator = factory(root.jQuery);
      }
    }(typeof self !== 'undefined' ? self : this, function($) {
      function Calculator() {
        this.value = 0;
      }

      Calculator.prototype.add = function(x) {
        this.value += x;
        return this;
      };

      Calculator.prototype.subtract = function(x) {
        this.value -= x;
        return this;
      };

      return {
        name: 'umd-module',
        Calculator: Calculator
      };
    }));
  `,
  iife: `
    (function(window) {
      'use strict';

      var Utils = {
        formatDate: function(date) {
          return date.toISOString().split('T')[0];
        },

        generateId: function() {
          return Math.random().toString(36).substr(2, 9);
        }
      };

      // 导出到全局
      window.Utils = Utils;

      // 同时支持CommonJS
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
          name: 'iife-module',
          Utils: Utils
        };
      }
    })(typeof window !== 'undefined' ? window : this);
  `
};