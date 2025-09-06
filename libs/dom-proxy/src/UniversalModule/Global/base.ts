// 创建一个假的全局对象，用于沙箱环境
export const fakeWindow = {
  setTimeout,
  clearTimeout,
  console
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
 * 自定义的 require 函数
 * 用于 CJS 模块加载依赖
 */
export const customRequire = (path: string) => {
  // 这里应该实现模块解析和加载逻辑
  // 简化版本，返回空对象
  console.log(`[Sandbox] 请求加载模块: ${path}`);
  return {};
};

/**
 * @description 创建沙箱环境
 * @returns 沙箱上下文对象
 */
/**
 * 创建沙箱环境
 * @returns 沙箱上下文对象
 */
export const createSandbox = () => {
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
    window: undefined as unknown as SandboxContext,
    global: undefined as unknown as SandboxContext,
    self: undefined as unknown as SandboxContext,
    returnExports: undefined
  };

  // 设置循环引用
  context.window = context;
  context.global = context;
  context.self = context;
  // 设置 document 属性
  // context.document = undefined;

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
