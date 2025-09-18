/**
 * Polyfill管理工具
 */

import type { 
  PolyfillInfo, 
  PolyfillLoadState, 
  CompatibilityConfig 
} from '../types/compatibility';

/**
 * 内置polyfill配置
 */
export const BUILTIN_POLYFILLS: Record<string, PolyfillInfo> = {
  'web-streams': {
    name: 'web-streams-polyfill',
    version: '4.0.0',
    url: 'https://unpkg.com/web-streams-polyfill@4.0.0/dist/polyfill.js',
    dependencies: [],
    detect: () => typeof globalThis.ReadableStream !== 'undefined'
  },
  
  'text-encoding': {
    name: 'text-encoding-polyfill',
    version: '0.7.0',
    url: 'https://unpkg.com/text-encoding@0.7.0/lib/encoding.js',
    dependencies: [],
    detect: () => typeof globalThis.TextEncoder !== 'undefined'
  },
  
  'compression-streams': {
    name: 'compression-streams-polyfill',
    version: '1.0.0',
    url: 'https://unpkg.com/compression-streams-polyfill@1.0.0/dist/polyfill.js',
    dependencies: ['web-streams'],
    detect: () => typeof globalThis.CompressionStream !== 'undefined'
  },
  
  'structured-clone': {
    name: 'structured-clone-polyfill',
    version: '1.0.0',
    url: 'https://unpkg.com/@ungap/structured-clone@1.0.0/esm/index.js',
    dependencies: [],
    detect: () => typeof globalThis.structuredClone === 'function'
  }
};

/**
 * Polyfill加载器类
 */
export class PolyfillLoader {
  private loadStates = new Map<string, PolyfillLoadState>();
  private config: CompatibilityConfig;
  private loadPromises = new Map<string, Promise<void>>();

  constructor(config: CompatibilityConfig = {}) {
    this.config = {
      autoLoadPolyfills: true,
      polyfillCDN: 'https://unpkg.com',
      ...config
    };
  }

  /**
   * 加载单个polyfill
   */
  async loadPolyfill(name: string): Promise<void> {
    // 检查是否已经在加载中
    if (this.loadPromises.has(name)) {
      return this.loadPromises.get(name)!;
    }

    const polyfillInfo = BUILTIN_POLYFILLS[name];
    if (!polyfillInfo) {
      throw new Error(`Unknown polyfill: ${name}`);
    }

    // 检查是否已经支持
    if (polyfillInfo.detect()) {
      this.setLoadState(name, { status: 'loaded' });
      return;
    }

    // 创建加载Promise
    const loadPromise = this.doLoadPolyfill(name, polyfillInfo);
    this.loadPromises.set(name, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadPromises.delete(name);
    }
  }

  /**
   * 执行polyfill加载
   */
  private async doLoadPolyfill(name: string, info: PolyfillInfo): Promise<void> {
    this.setLoadState(name, { 
      status: 'loading', 
      startTime: Date.now() 
    });

    try {
      // 先加载依赖
      for (const dep of info.dependencies || []) {
        await this.loadPolyfill(dep);
      }

      // 加载polyfill
      await this.loadScript(this.getPolyfillUrl(info));

      // 验证加载结果
      if (!info.detect()) {
        throw new Error(`Polyfill ${name} loaded but feature still not available`);
      }

      this.setLoadState(name, { 
        status: 'loaded', 
        endTime: Date.now() 
      });

      if (this.config.debug) {
        console.log(`[PolyfillLoader] Successfully loaded ${name}`);
      }

    } catch (error) {
      this.setLoadState(name, { 
        status: 'error', 
        error: error as Error,
        endTime: Date.now() 
      });

      if (this.config.debug) {
        console.error(`[PolyfillLoader] Failed to load ${name}:`, error);
      }

      throw error;
    }
  }

  /**
   * 加载脚本
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否在Node.js环境
      if (typeof document === 'undefined') {
        // Node.js环境，使用动态import
        this.loadModuleInNode(url).then(resolve).catch(reject);
        return;
      }

      // 浏览器环境，使用script标签
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        document.head.removeChild(script);
        resolve();
      };
      
      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * 在Node.js环境中加载模块
   */
  private async loadModuleInNode(url: string): Promise<void> {
    try {
      // 尝试使用动态import
      await import(url);
    } catch (error) {
      // 如果动态import失败，尝试使用require
      if (typeof require !== 'undefined') {
        require(url);
      } else {
        throw error;
      }
    }
  }

  /**
   * 获取polyfill URL
   */
  private getPolyfillUrl(info: PolyfillInfo): string {
    if (info.url.startsWith('http')) {
      return info.url;
    }
    
    // 使用配置的CDN
    const baseUrl = this.config.polyfillCDN || 'https://unpkg.com';
    return `${baseUrl}/${info.name}@${info.version}/${info.url}`;
  }

  /**
   * 设置加载状态
   */
  private setLoadState(name: string, state: Partial<PolyfillLoadState>): void {
    const currentState = this.loadStates.get(name) || { status: 'pending' };
    this.loadStates.set(name, { ...currentState, ...state });
  }

  /**
   * 获取加载状态
   */
  getLoadState(name: string): PolyfillLoadState {
    return this.loadStates.get(name) || { status: 'pending' };
  }

  /**
   * 批量加载polyfill
   */
  async loadPolyfills(names: string[]): Promise<void> {
    const loadPromises = names.map(name => this.loadPolyfill(name));
    await Promise.all(loadPromises);
  }

  /**
   * 自动加载必需的polyfill
   */
  async autoLoadPolyfills(): Promise<void> {
    if (!this.config.autoLoadPolyfills) {
      return;
    }

    const requiredPolyfills: string[] = [];

    // 检查Stream API
    if (!BUILTIN_POLYFILLS['web-streams'].detect()) {
      requiredPolyfills.push('web-streams');
    }

    // 检查TextEncoder/TextDecoder
    if (!BUILTIN_POLYFILLS['text-encoding'].detect()) {
      requiredPolyfills.push('text-encoding');
    }

    // 检查结构化克隆
    if (!BUILTIN_POLYFILLS['structured-clone'].detect()) {
      requiredPolyfills.push('structured-clone');
    }

    if (requiredPolyfills.length > 0) {
      if (this.config.debug) {
        console.log(`[PolyfillLoader] Auto-loading polyfills:`, requiredPolyfills);
      }
      
      await this.loadPolyfills(requiredPolyfills);
    }
  }

  /**
   * 获取所有加载状态
   */
  getAllLoadStates(): Record<string, PolyfillLoadState> {
    const states: Record<string, PolyfillLoadState> = {};
    for (const [name, state] of this.loadStates) {
      states[name] = state;
    }
    return states;
  }

  /**
   * 清理加载状态
   */
  clear(): void {
    this.loadStates.clear();
    this.loadPromises.clear();
  }
}

/**
 * 条件加载polyfill
 */
export async function conditionalLoadPolyfill(
  feature: string, 
  polyfillName: string,
  loader: PolyfillLoader
): Promise<boolean> {
  const polyfillInfo = BUILTIN_POLYFILLS[polyfillName];
  if (!polyfillInfo) {
    console.warn(`[PolyfillLoader] Unknown polyfill: ${polyfillName}`);
    return false;
  }

  // 检查特性是否已支持
  if (polyfillInfo.detect()) {
    return true;
  }

  try {
    await loader.loadPolyfill(polyfillName);
    return polyfillInfo.detect();
  } catch (error) {
    console.error(`[PolyfillLoader] Failed to load polyfill for ${feature}:`, error);
    return false;
  }
}

/**
 * 创建默认polyfill加载器
 */
export function createPolyfillLoader(config?: CompatibilityConfig): PolyfillLoader {
  return new PolyfillLoader(config);
}

/**
 * 全局polyfill加载器实例
 */
let globalLoader: PolyfillLoader | null = null;

/**
 * 获取全局polyfill加载器
 */
export function getGlobalPolyfillLoader(): PolyfillLoader {
  if (!globalLoader) {
    globalLoader = new PolyfillLoader();
  }
  return globalLoader;
}

/**
 * 设置全局polyfill加载器
 */
export function setGlobalPolyfillLoader(loader: PolyfillLoader): void {
  globalLoader = loader;
}