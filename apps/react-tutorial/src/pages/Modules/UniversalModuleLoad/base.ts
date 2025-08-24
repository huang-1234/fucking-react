/**
 * 通用模块加载器
 * 支持 AMD、CJS、ESM、UMD 的多格式 JS 模块加载
 */

import { fakeWindow } from "../Global/base";

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
  // 修改ESM检测正则，使其更准确地匹配export语句
  if (/\bexport\s+(default\b|\{|\*|const\s+|let\s+|var\s+|function\s+|class\s+)|import\s+/.test(code)) return ModuleType.ESM;
  if (/define\(.*?function\s*\(/.test(code)) return ModuleType.AMD;
  // UMD检测需要在CJS之前，因为UMD通常也包含CJS的特征
  if (/\(function\s*\([^)]*\broot\b[^)]*,\s*\bfactory\b[^)]*\)/.test(code)) return ModuleType.UMD;
  if (/exports.*?\=|\bmodule\.exports\b/.test(code)) return ModuleType.CJS;
  return ModuleType.IIFE; // 兜底为立即执行函数
};

export interface SandboxContext {
  require: (path: string) => any;
  exports: any;
  module: { exports: any };
  define: (deps: string[] | undefined, factory: Function) => any;
  console: any;
  setTimeout: (callback: () => void, timeout: number) => number;
  clearTimeout: (id: number) => void;
  // 以下是 UMD 模块需要的属性
  window: SandboxContext;
  global: SandboxContext;
  self: SandboxContext;
  returnExports: any;
}

/**
 * @description 创建沙箱环境
 * @returns 沙箱上下文对象
 */
export const createSandbox = (): SandboxContext => {
  // 创建模块上下文
  const context: SandboxContext = {
    require: customRequire,
    exports: {},
    module: { exports: {} },
    define: () => { }, // 将在 AMD 执行器中定义
    console: {
      log: (...args: any[]) => console.log('[Sandbox]', ...args),
      warn: (...args: any[]) => console.warn('[Sandbox]', ...args),
      error: (...args: any[]) => console.error('[Sandbox]', ...args),
    },
    setTimeout: setTimeout.bind(fakeWindow),
    clearTimeout: clearTimeout.bind(fakeWindow),
    window: {} as SandboxContext, // 初始化为空对象，避免循环引用
    global: {} as SandboxContext,
    self: {} as SandboxContext,
    returnExports: {},
  };

  // 设置循环引用
  context.window = context;
  context.global = context;
  context.self = context;

  // 使用 Proxy 进行安全访问控制
  return new Proxy(context, {
    get(target, key: string | symbol) {
      // 允许访问预定义的安全属性
      if (key in target) {
        return target[key as keyof typeof target];
      }

      // 阻止访问全局对象
      if (key === 'window' || key === 'globalThis' || key === 'document') {
        console.warn(`[Sandbox] 阻止访问全局对象: ${String(key)}`);
        return {};
      }

      // 默认返回 undefined
      return undefined;
    },
    set(target, key, value) {
      if (key === 'module' || key === 'exports') {
        // 允许修改module.exports的内容，但不允许完全替换对象
        if (typeof value === 'object') {
          Object.assign(target[key as keyof typeof target], value);
        } else {
          target.module.exports = value;
          target.exports = value;
        }
        return true;
      } else if (key === 'require') {
        target[key as keyof typeof target] = value;
        return true;
      }

      // 允许设置其他属性，但发出警告
      console.warn(`[Sandbox] 设置属性: ${String(key)}`);
      (target as any)[key] = value;
      return true;
    }
  });
};

/**
 * 自定义的 require 函数
 * 用于 CJS 模块加载依赖
 */
const customRequire = (path: string) => {
  // 这里应该实现模块解析和加载逻辑
  // 简化版本，返回空对象
  console.log(`[Sandbox] 请求加载模块: ${path}`);
  return {};
};

/**
 * 执行 AMD 模块
 * @param code 模块代码
 * @param sandbox 沙箱环境
 * @returns 模块导出
 */
export const executeAMD = (code: string, sandbox: SandboxContext) => {
  // 实现 AMD 的 define 函数
  let moduleExports: any = undefined;

  sandbox.define = (deps: string[] = [], factory: Function) => {
    // 简化版本，不处理实际依赖
    const resolvedDeps = deps.map(() => ({}));
    moduleExports = factory(...resolvedDeps);
    return moduleExports;
  };

  // 使用 Function 构造函数执行代码，绑定沙箱上下文
  try {
    new Function('define', 'require', 'module', 'exports', code)(
      sandbox.define,
      sandbox.require,
      sandbox.module,
      sandbox.exports
    );

    return moduleExports;
  } catch (error) {
    console.error('[Sandbox] AMD 执行错误:', error);
    throw error;
  }
};

/**
 * 执行 CJS 模块
 * @param code 模块代码
 * @param sandbox 沙箱环境
 * @returns 模块导出
 */
export const executeCJS = (code: string, sandbox: SandboxContext) => {
  // 包装 CJS 模块代码
  try {
    // 直接执行代码，不需要包装
    new Function('module', 'exports', 'require', code)(
      sandbox.module,
      sandbox.exports,
      sandbox.require
    );

    // 返回模块导出
    return sandbox.module.exports;
  } catch (error) {
    console.error('[Sandbox] CJS 执行错误:', error);
    throw error;
  }
};

interface ESMModuleExports {
  exports?: any;
  default?: any;
  [key: string]: any;
}

/**
 * 执行 ESM 模块
 * @param code ESM 模块代码
 * @returns Promise，解析为模块命名空间对象
 */
export const executeESM = async (code: string): Promise<ESMModuleExports> => {
  // 创建 Blob URL
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  try {
    // 使用 import() 动态导入模块
    const module = await import(/* @vite-ignore */ url) as ESMModuleExports;
    return module;
  } catch (error) {
    console.error('[Sandbox] ESM 执行错误:', error);
    throw error;
  } finally {
    // 清理 Blob URL
    URL.revokeObjectURL(url);
  }
};

/**
 * 执行 UMD 模块
 * @param code UMD 模块代码
 * @param sandbox 沙箱环境
 * @returns 模块导出
 */
export const executeUMD = (code: string, sandbox: SandboxContext) => {
  try {
    // 直接在沙箱环境中执行UMD代码
    new Function('window', 'module', 'exports', 'require', 'global', 'self', code)(
      sandbox,
      sandbox.module,
      sandbox.exports,
      sandbox.require,
      sandbox,
      sandbox
    );

    // UMD模块可能会设置returnExports、module.exports或全局变量
    return sandbox.module.exports;
  } catch (error) {
    console.error('[Sandbox] UMD 执行错误:', error);
    throw error;
  }
};

/**
 * 执行 IIFE 模块
 * @param code IIFE 模块代码
 * @param sandbox 沙箱环境
 * @returns 模块导出
 */
export const executeIIFE = (code: string, sandbox: SandboxContext) => {
  try {
    // 直接在沙箱环境中执行IIFE代码
    new Function('window', 'document', 'exports', 'module', code)(
      sandbox,
      {},  // 提供空的document对象
      sandbox.exports,
      sandbox.module
    );

    // IIFE可能会设置全局变量或修改exports
    return sandbox.exports || sandbox.module.exports;
  } catch (error) {
    console.error('[Sandbox] IIFE 执行错误:', error);
    throw error;
  }
};

/**
 * 安全提取模块导出
 * @param exports 模块导出对象
 * @param sandbox 沙箱环境
 * @returns 安全的模块导出代理
 */
export const createSafeExports = (exports: any, sandbox: SandboxContext) => {
  // 确保exports是一个对象
  if (!exports || typeof exports !== 'object') {
    exports = { default: exports };
  }

  return new Proxy(exports, {
    get(target, key) {
      const value = target[key];

      // 函数绑定沙箱上下文
      if (typeof value === 'function') {
        return value.bind(sandbox);
      }

      // 深拷贝对象，避免污染
      if (typeof value === 'object' && value !== null) {
        try {
          return structuredClone(value);
        } catch (e) {
          // 如果不支持 structuredClone，使用 JSON 深拷贝
          return JSON.parse(JSON.stringify(value));
        }
      }

      // 原始值直接返回
      return value;
    }
  });
};

// 模块加载缓存
const moduleCache = new Map<string, any>();

/**
 * 检测循环依赖
 */
const loadingModules = new Set<string>();
const MAX_DEPTH = 20; // 最大依赖深度

/**
 * 统一入口函数 - 加载模块
 * @param code 模块代码
 * @param moduleId 可选的模块ID，用于缓存
 * @returns Promise，解析为模块导出
 */
export async function loadModule(code: string, moduleId?: string): Promise<any> {
  // 如果提供了模块ID且已缓存，直接返回
  if (moduleId && moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  // 检测循环依赖
  if (moduleId) {
    if (loadingModules.has(moduleId)) {
      throw new Error(`检测到循环依赖: ${moduleId}`);
    }

    if (loadingModules.size >= MAX_DEPTH) {
      throw new Error(`超过最大依赖深度 (${MAX_DEPTH})`);
    }

    loadingModules.add(moduleId);
  }

  try {
    // 检测模块类型
    const type = detectModuleType(code);
    const sandbox = createSandbox();

    let exports;
    switch (type) {
      case ModuleType.AMD:
        exports = executeAMD(code, sandbox);
        break;
      case ModuleType.CJS:
        exports = executeCJS(code, sandbox);
        break;
      case ModuleType.ESM:
        exports = await executeESM(code);
        break;
      case ModuleType.UMD:
        exports = executeUMD(code, sandbox);
        break;
      case ModuleType.IIFE:
        exports = executeIIFE(code, sandbox);
        break;
    }

    // 创建安全的导出对象
    const safeExports = createSafeExports(exports, sandbox);

    // 缓存模块导出
    if (moduleId) {
      moduleCache.set(moduleId, safeExports);
    }

    return safeExports;
  } finally {
    // 清理循环依赖检测状态
    if (moduleId) {
      loadingModules.delete(moduleId);
    }
  }
}

/**
 * 卸载模块
 * @param moduleId 模块ID
 */
export const unloadModule = (moduleId: string): boolean => {
  return moduleCache.delete(moduleId);
};

/**
 * 清除所有模块缓存
 */
export const clearModuleCache = (): void => {
  moduleCache.clear();
};

/**
 * 过滤恶意代码
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

/**
 * 安全加载模块
 * @param code 模块代码
 * @param moduleId 可选的模块ID
 * @returns Promise，解析为模块导出或错误
 */
export const safeLoadModule = async (code: string, moduleId?: string): Promise<any> => {
  // 检查恶意代码
  if (containsMaliciousCode(code)) {
    throw new Error('检测到潜在的恶意代码');
  }

  try {
    return await loadModule(code, moduleId);
  } catch (error) {
    console.error('[ModuleLoader] 模块加载失败:', error);
    throw error;
  }
};