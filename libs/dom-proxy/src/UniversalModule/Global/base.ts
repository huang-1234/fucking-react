// 创建一个假的全局对象，用于沙箱环境
export const fakeWindow = {
  setTimeout,
  clearTimeout,
  console
};


export interface SandboxContext {
  require: (path: string) => unknown;
  exports: unknown;
  module: { exports: unknown };
  define: (deps: string[] | undefined, factory: Function) => unknown;
  console: any;
  setTimeout: (callback: () => void, timeout: number) => number;
  clearTimeout: (id: number) => void;
  // 以下是 UMD 模块需要的属性
  window: SandboxContext;
  global: SandboxContext;
  self: SandboxContext;
  returnExports: unknown;
  document: Document;
}

/**
 * 自定义的 require 函数
 * 用于 CJS 模块加载依赖
 */
// 模块缓存，用于存储已加载的模块
const moduleRegistry = new Map<string, any>();

// 正在加载中的模块路径，用于检测循环依赖
const loadingModules = new Set<string>();

// 仅用于测试的辅助函数
export const __test_helpers = {
  addLoadingModule: (moduleId: string) => loadingModules.add(moduleId),
  clearLoadingModules: () => loadingModules.clear(),
  getLoadingModules: () => new Set(loadingModules)
};

// 模块解析配置
interface ModuleResolveOptions {
  basePath?: string;
  extensions?: string[];
  aliases?: Record<string, string>;
}

// 默认配置
const defaultResolveOptions: ModuleResolveOptions = {
  basePath: '/',
  extensions: ['.js', '.json'],
  aliases: {}
};

// 模块解析器
const resolveModulePath = (path: string, options: ModuleResolveOptions = defaultResolveOptions): string => {
  // 处理别名
  const aliases = options.aliases || {};
  for (const [alias, target] of Object.entries(aliases)) {
    if (path === alias || path.startsWith(`${alias}/`)) {
      path = path.replace(alias, target);
      break;
    }
  }

  // 处理相对路径
  if (path.startsWith('./') || path.startsWith('../')) {
    const basePath = options.basePath || '/';
    path = normalizePath(`${basePath}/${path}`);
  }

  // 处理扩展名
  const extensions = options.extensions || ['.js', '.json'];
  if (!extensions.some(ext => path.endsWith(ext))) {
    // 尝试添加扩展名
    for (const ext of extensions) {
      try {
        // 在实际环境中，这里应该检查文件是否存在
        return `${path}${ext}`;
      } catch (e) {
        // 继续尝试下一个扩展名
      }
    }
  }

  return path;
};

// 规范化路径
const normalizePath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  const result = [];

  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else if (part !== '.') {
      result.push(part);
    }
  }

  return '/' + result.join('/');
};

/**
 * 自定义的 require 函数
 * 用于 CJS 模块加载依赖
 * @param path 模块路径
 * @param options 解析选项
 * @returns 模块导出
 */
export const customRequire = (path: string, options?: ModuleResolveOptions) => {
  // 解析模块路径
  const resolvedPath = resolveModulePath(path, options);

  // 检查缓存
  if (moduleRegistry.has(resolvedPath)) {
    return moduleRegistry.get(resolvedPath);
  }

  // 检测循环依赖
  if (loadingModules.has(resolvedPath)) {
    console.warn(`[Sandbox] 检测到循环依赖: ${resolvedPath}`);
    // 返回部分加载的模块（如果存在）或空对象
    return moduleRegistry.get(resolvedPath) || {};
  }

  // 标记为正在加载
  loadingModules.add(resolvedPath);

  try {
    // 内置模块处理
    const builtinModules: Record<string, any> = {
      'path': {
        join: (...parts: string[]) => parts.join('/'),
        resolve: (from: string, to: string) => normalizePath(`${from}/${to}`),
        basename: (path: string) => path.split('/').pop() || '',
        dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
        extname: (path: string) => {
          const match = path.match(/\.[^.]+$/);
          return match ? match[0] : '';
        }
      },
      'fs': {
        readFileSync: () => { throw new Error('[Sandbox] 文件系统访问被禁止'); },
        writeFileSync: () => { throw new Error('[Sandbox] 文件系统访问被禁止'); }
      },
      'events': {
        EventEmitter: class EventEmitter {
          private listeners: Record<string, Function[]> = {};

          on(event: string, listener: Function) {
            if (!this.listeners[event]) {
              this.listeners[event] = [];
            }
            this.listeners[event].push(listener);
            return this;
          }

          emit(event: string, ...args: any[]) {
            const eventListeners = this.listeners[event] || [];
            eventListeners.forEach(listener => listener(...args));
            return eventListeners.length > 0;
          }

          removeListener(event: string, listener: Function) {
            if (this.listeners[event]) {
              this.listeners[event] = this.listeners[event].filter(l => l !== listener);
            }
            return this;
          }
        }
      },
      'util': {
        inherits: (ctor: any, superCtor: any) => {
          Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
          ctor.super_ = superCtor;
        },
        promisify: (fn: Function) => {
          return (...args: any[]) => {
            return new Promise((resolve, reject) => {
              fn(...args, (err: Error, result: any) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          };
        }
      }
    };

    // 处理内置模块
    if (Object.prototype.hasOwnProperty.call(builtinModules, resolvedPath)) {
      const moduleExports = builtinModules[resolvedPath];
      moduleRegistry.set(resolvedPath, moduleExports);
      return moduleExports;
    }

    // 处理第三方模块
    // 在真实环境中，这里应该从CDN或本地文件系统加载模块
    console.log(`[Sandbox] 请求加载模块: ${resolvedPath}`);

    // 创建模块对象
    const moduleExports = {};

    // 缓存模块导出（即使是空的，用于处理循环依赖）
    moduleRegistry.set(resolvedPath, moduleExports);

    // 这里应该异步加载模块代码并执行
    // 由于沙箱限制，我们返回一个模拟的模块对象
    return moduleExports;
  } catch (error) {
    console.error(`[Sandbox] 加载模块失败: ${resolvedPath}`, error);
    throw error;
  } finally {
    // 标记为加载完成
    loadingModules.delete(resolvedPath);
  }
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
      log: (...args: unknown[]) => console.log('[SystemJS Sandbox]', ...args),
      warn: (...args: unknown[]) => console.warn('[SystemJS Sandbox]', ...args),
      error: (...args: unknown[]) => console.error('[SystemJS Sandbox]', ...args),
    },
    setTimeout: setTimeout.bind(fakeWindow),
    clearTimeout: clearTimeout.bind(fakeWindow),
    window: undefined as unknown as SandboxContext,
    document: undefined as unknown as Document,
    global: undefined as unknown as SandboxContext,
    self: undefined as unknown as SandboxContext,
    returnExports: undefined
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
        console.warn(`[Sandbox] 阻止访问全局对象: ${String(key)}`);
        return {};
      }

      // 默认返回undefined
      return undefined;
    },
    set(target, key, value) {
      if (key === 'module' || key === 'exports') {
        if (key === 'module' && typeof value === 'object') {
          // 如果设置整个module对象
          if (value.exports !== undefined) {
            target.module.exports = value.exports;
            target.exports = value.exports; // 同步exports
          } else {
            Object.assign(target.module, value);
          }
        } else if (key === 'exports') {
          // 直接设置exports
          target.exports = value;
          target.module.exports = value; // 同步module.exports
        } else if (key === 'module.exports') {
          // 直接设置module.exports
          target.module.exports = value;
          target.exports = value; // 同步exports
        }
        return true;
      } else if (key === 'require' || key === 'define') {
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
