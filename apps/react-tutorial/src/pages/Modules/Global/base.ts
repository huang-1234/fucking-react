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
