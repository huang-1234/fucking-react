/**
 * SecLinter 插件沙箱隔离机制
 * 提供安全的执行环境，限制插件的访问权限
 */
import { Sandbox, PluginPermission, PluginHelpers } from './pluginInterface';
import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

/**
 * 沙箱配置选项
 */
export interface SandboxOptions {
  /** 允许的权限 */
  permissions: PluginPermission[];
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 内存限制（MB） */
  memoryLimit?: number;
  /** 是否允许网络请求 */
  allowNetwork?: boolean;
  /** 是否允许文件系统操作 */
  allowFs?: boolean;
  /** 是否允许执行命令 */
  allowExec?: boolean;
  /** 允许访问的模块白名单 */
  allowedModules?: string[];
  /** 自定义上下文 */
  context?: Record<string, any>;
}

/**
 * 默认沙箱配置
 */
const DEFAULT_SANDBOX_OPTIONS: SandboxOptions = {
  permissions: ['fs:read'],
  timeout: 5000,
  memoryLimit: 100,
  allowNetwork: false,
  allowFs: true,
  allowExec: false,
  allowedModules: ['path', 'util', 'crypto']
};

/**
 * 创建安全的HTTP客户端
 * @param allowNetwork 是否允许网络请求
 */
function createSecureHttpClient(allowNetwork: boolean) {
  if (!allowNetwork) {
    return {
      get: async () => {
        throw new Error('Network access is not allowed in this sandbox');
      },
      post: async () => {
        throw new Error('Network access is not allowed in this sandbox');
      }
    };
  }

  const instance = axios.create({
    timeout: 5000,
    maxRedirects: 3,
    headers: {
      'User-Agent': 'SecLinter/1.0'
    }
  });

  // 添加请求拦截器，限制请求频率
  let lastRequestTime = 0;
  const MIN_REQUEST_INTERVAL = 1000; // 最小请求间隔（毫秒）

  instance.interceptors.request.use(async (config) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
    return config;
  });

  return {
    get: async (url: string, options?: any) => {
      return instance.get(url, options);
    },
    post: async (url: string, data?: any, options?: any) => {
      return instance.post(url, data, options);
    }
  };
}

/**
 * 创建安全的文件系统API
 * @param allowFs 是否允许文件系统操作
 * @param permissions 权限列表
 */
function createSecureFs(allowFs: boolean, permissions: PluginPermission[]) {
  if (!allowFs) {
    return {
      readFile: async () => {
        throw new Error('File system access is not allowed in this sandbox');
      },
      writeFile: async () => {
        throw new Error('File system access is not allowed in this sandbox');
      },
      exists: async () => {
        throw new Error('File system access is not allowed in this sandbox');
      }
    };
  }

  const canRead = permissions.includes('fs:read');
  const canWrite = permissions.includes('fs:write');

  return {
    readFile: async (filePath: string) => {
      if (!canRead) {
        throw new Error('File read permission is not granted');
      }
      return fs.promises.readFile(filePath, 'utf-8');
    },
    writeFile: async (filePath: string, content: string) => {
      if (!canWrite) {
        throw new Error('File write permission is not granted');
      }
      return fs.promises.writeFile(filePath, content, 'utf-8');
    },
    exists: async (filePath: string) => {
      if (!canRead) {
        throw new Error('File read permission is not granted');
      }
      try {
        await fs.promises.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
  };
}

/**
 * 创建安全的路径操作API
 */
function createSecurePath() {
  return {
    join: (...paths: string[]) => path.join(...paths),
    resolve: (...paths: string[]) => path.resolve(...paths),
    dirname: (p: string) => path.dirname(p),
    basename: (p: string) => path.basename(p)
  };
}

/**
 * 创建插件助手工具
 * @param options 沙箱配置
 */
function createPluginHelpers(options: SandboxOptions): PluginHelpers {
  return {
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`),
      debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
    },
    httpClient: createSecureHttpClient(options.allowNetwork || false),
    fs: createSecureFs(options.allowFs || false, options.permissions),
    path: createSecurePath()
  };
}

/**
 * 插件沙箱实现类
 */
export class PluginSandbox implements Sandbox {
  private context: vm.Context;
  private options: SandboxOptions;
  private helpers: PluginHelpers;

  /**
   * 创建插件沙箱
   * @param options 沙箱配置
   */
  constructor(options: Partial<SandboxOptions> = {}) {
    this.options = { ...DEFAULT_SANDBOX_OPTIONS, ...options };
    this.helpers = createPluginHelpers(this.options);

    // 创建安全的沙箱上下文
    const contextObject = {
      console: {
        log: (...args: any[]) => this.helpers.logger.info(args.join(' ')),
        warn: (...args: any[]) => this.helpers.logger.warn(args.join(' ')),
        error: (...args: any[]) => this.helpers.logger.error(args.join(' ')),
        debug: (...args: any[]) => this.helpers.logger.debug(args.join(' '))
      },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      ...this.options.context
    };

    this.context = vm.createContext(contextObject);
  }

  /**
   * 在沙箱中执行代码
   * @param code 要执行的代码
   * @returns 执行结果
   */
  run<T>(code: string): T {
    try {
      const script = new vm.Script(code, {
        timeout: this.options.timeout,
        displayErrors: true
      });

      return script.runInContext(this.context) as T;
    } catch (error) {
      throw new Error(`Sandbox execution error: ${(error as Error).message}`);
    }
  }

  /**
   * 获取沙箱API
   * @returns 沙箱API
   */
  getApi(): Record<string, any> {
    return {
      helpers: this.helpers,
      require: this.createSecureRequire()
    };
  }

  /**
   * 创建安全的require函数
   * @returns 安全的require函数
   */
  private createSecureRequire() {
    const allowedModules = new Set(this.options.allowedModules || []);

    return (moduleName: string) => {
      if (!allowedModules.has(moduleName)) {
        throw new Error(`Module '${moduleName}' is not allowed in this sandbox`);
      }

      try {
        return require(moduleName);
      } catch (error) {
        throw new Error(`Failed to load module '${moduleName}': ${(error as Error).message}`);
      }
    };
  }
}

/**
 * 创建插件沙箱
 * @param options 沙箱配置
 * @returns 插件沙箱实例
 */
export function createSandbox(options: Partial<SandboxOptions> = {}): Sandbox {
  return new PluginSandbox(options);
}

/**
 * 在沙箱中运行插件
 * @param pluginPath 插件路径
 * @param sandbox 沙箱实例
 * @returns 插件实例
 */
export async function runPluginInSandbox(pluginPath: string, sandbox: Sandbox): Promise<any> {
  try {
    const pluginCode = await fs.promises.readFile(pluginPath, 'utf-8');
    return sandbox.run(pluginCode);
  } catch (error) {
    throw new Error(`Failed to run plugin in sandbox: ${(error as Error).message}`);
  }
}
