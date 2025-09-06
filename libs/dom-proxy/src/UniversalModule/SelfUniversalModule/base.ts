/**
 * 通用模块加载器
 * 支持 AMD、CJS、ESM、UMD 的多格式 JS 模块加载
 */

import { createSandbox, detectModuleType, ModuleType, type SandboxContext } from "../Global/base";
import { containsMaliciousCode } from "../Tools/code";




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
 * 通过loadModule安全加载模块
 * @param code 模块代码
 * @param moduleId 可选的模块ID
 * @returns Promise，解析为模块导出或错误
 */
export const safeLoadModuleSelf = async (code: string, moduleId?: string): Promise<any> => {
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