/**
 * 与UniversalModule的集成
 * 支持动态polyfill加载和模块化管理
 */

import type { CompatibilityConfig } from '../types/compatibility';
import { getDefaultCompatibilityManager } from '../core/CompatibilityManager';
import { getGlobalPolyfillLoader } from '../utils/polyfills';

/**
 * Stream模块的UniversalModule配置
 */
export interface StreamUniversalConfig {
  /** 是否启用自动polyfill加载 */
  autoPolyfill?: boolean;
  /** polyfill CDN配置 */
  polyfillCDN?: string;
  /** 模块加载策略 */
  loadStrategy?: 'eager' | 'lazy' | 'on-demand';
  /** 兼容性检查级别 */
  compatibilityLevel?: 'strict' | 'loose' | 'permissive';
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * Stream模块的UniversalModule适配器
 */
export class StreamUniversalAdapter {
  private config: StreamUniversalConfig;
  private initialized = false;
  private loadPromises = new Map<string, Promise<any>>();

  constructor(config: StreamUniversalConfig = {}) {
    this.config = {
      autoPolyfill: true,
      polyfillCDN: 'https://unpkg.com',
      loadStrategy: 'lazy',
      compatibilityLevel: 'loose',
      debug: false,
      ...config
    };
  }

  /**
   * 初始化适配器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      if (this.config.debug) {
        console.log('[StreamUniversalAdapter] Initializing...');
      }

      // 检查兼容性
      const compatibilityManager = getDefaultCompatibilityManager();
      const compatibilityResult = compatibilityManager.checkCompatibility();

      if (this.config.debug) {
        console.log('[StreamUniversalAdapter] Compatibility check:', compatibilityResult);
      }

      // 根据兼容性级别决定是否继续
      if (this.config.compatibilityLevel === 'strict' && !compatibilityResult.compatible) {
        throw new Error(`Strict compatibility check failed: ${compatibilityResult.warnings.join(', ')}`);
      }

      // 自动加载polyfill
      if (this.config.autoPolyfill && compatibilityResult.requiredPolyfills.length > 0) {
        await this.loadRequiredPolyfills(compatibilityResult.requiredPolyfills);
      }

      this.initialized = true;

      if (this.config.debug) {
        console.log('[StreamUniversalAdapter] Initialized successfully');
      }

    } catch (error) {
      console.error('[StreamUniversalAdapter] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 加载必需的polyfill
   */
  private async loadRequiredPolyfills(polyfills: string[]): Promise<void> {
    const polyfillLoader = getGlobalPolyfillLoader();
    
    if (this.config.debug) {
      console.log('[StreamUniversalAdapter] Loading polyfills:', polyfills);
    }

    try {
      await polyfillLoader.loadPolyfills(polyfills);
    } catch (error) {
      if (this.config.compatibilityLevel === 'strict') {
        throw error;
      }
      
      console.warn('[StreamUniversalAdapter] Some polyfills failed to load:', error);
    }
  }

  /**
   * 动态加载Stream模块组件
   */
  async loadComponent(componentName: string): Promise<any> {
    if (this.loadPromises.has(componentName)) {
      return this.loadPromises.get(componentName);
    }

    const loadPromise = this.doLoadComponent(componentName);
    this.loadPromises.set(componentName, loadPromise);

    try {
      const component = await loadPromise;
      return component;
    } catch (error) {
      this.loadPromises.delete(componentName);
      throw error;
    }
  }

  /**
   * 执行组件加载
   */
  private async doLoadComponent(componentName: string): Promise<any> {
    if (this.config.debug) {
      console.log(`[StreamUniversalAdapter] Loading component: ${componentName}`);
    }

    switch (componentName) {
      case 'BinaryData':
        const { BinaryData } = await import('../core/BinaryData');
        return BinaryData;

      case 'DataTransfer':
        const { DataTransfer } = await import('../core/DataTransfer');
        return DataTransfer;

      case 'StreamOperations':
        const { StreamOperations } = await import('../core/StreamOperations');
        return StreamOperations;

      case 'CompatibilityManager':
        const { CompatibilityManager } = await import('../core/CompatibilityManager');
        return CompatibilityManager;

      default:
        throw new Error(`Unknown component: ${componentName}`);
    }
  }

  /**
   * 预加载核心组件
   */
  async preloadCore(): Promise<void> {
    const coreComponents = ['BinaryData', 'StreamOperations', 'CompatibilityManager'];
    
    if (this.config.debug) {
      console.log('[StreamUniversalAdapter] Preloading core components');
    }

    await Promise.all(
      coreComponents.map(component => this.loadComponent(component))
    );
  }

  /**
   * 检查组件是否可用
   */
  isComponentAvailable(componentName: string): boolean {
    try {
      switch (componentName) {
        case 'BinaryData':
        case 'DataTransfer':
        case 'StreamOperations':
        case 'CompatibilityManager':
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * 获取模块信息
   */
  getModuleInfo(): {
    name: string;
    version: string;
    initialized: boolean;
    loadedComponents: string[];
    compatibilityLevel: string;
  } {
    return {
      name: 'Stream',
      version: '1.0.0',
      initialized: this.initialized,
      loadedComponents: Array.from(this.loadPromises.keys()),
      compatibilityLevel: this.config.compatibilityLevel || 'loose'
    };
  }

  /**
   * 重置适配器
   */
  reset(): void {
    this.initialized = false;
    this.loadPromises.clear();
  }
}

/**
 * 创建Stream模块的UniversalModule注册配置
 */
export function createStreamUniversalConfig(config: StreamUniversalConfig = {}): {
  name: string;
  adapter: StreamUniversalAdapter;
  dependencies: string[];
  optional: boolean;
} {
  return {
    name: 'Stream',
    adapter: new StreamUniversalAdapter(config),
    dependencies: [], // Stream模块没有依赖其他模块
    optional: false
  };
}

/**
 * Stream模块工厂函数
 */
export class StreamModuleFactory {
  private static instance: StreamModuleFactory | null = null;
  private adapter: StreamUniversalAdapter | null = null;

  private constructor() {}

  static getInstance(): StreamModuleFactory {
    if (!StreamModuleFactory.instance) {
      StreamModuleFactory.instance = new StreamModuleFactory();
    }
    return StreamModuleFactory.instance;
  }

  /**
   * 创建Stream模块实例
   */
  async createModule(config: StreamUniversalConfig = {}): Promise<StreamUniversalAdapter> {
    if (this.adapter) {
      return this.adapter;
    }

    this.adapter = new StreamUniversalAdapter(config);
    await this.adapter.initialize();
    
    return this.adapter;
  }

  /**
   * 获取当前适配器
   */
  getAdapter(): StreamUniversalAdapter | null {
    return this.adapter;
  }

  /**
   * 重置工厂
   */
  reset(): void {
    if (this.adapter) {
      this.adapter.reset();
      this.adapter = null;
    }
  }
}

/**
 * 与LazyLoader集成的懒加载配置
 */
export const STREAM_LAZY_LOAD_CONFIG = {
  // 核心组件懒加载配置
  components: {
    'stream.binary-data': {
      loader: () => import('../core/BinaryData'),
      dependencies: [],
      preload: false
    },
    'stream.data-transfer': {
      loader: () => import('../core/DataTransfer'),
      dependencies: ['stream.binary-data', 'stream.operations'],
      preload: false
    },
    'stream.operations': {
      loader: () => import('../core/StreamOperations'),
      dependencies: ['stream.binary-data'],
      preload: false
    },
    'stream.compatibility': {
      loader: () => import('../core/CompatibilityManager'),
      dependencies: [],
      preload: true // 兼容性管理器需要预加载
    }
  },

  // 工具函数懒加载配置
  utils: {
    'stream.detection': {
      loader: () => import('../utils/detection'),
      dependencies: [],
      preload: true
    },
    'stream.polyfills': {
      loader: () => import('../utils/polyfills'),
      dependencies: ['stream.detection'],
      preload: true
    },
    'stream.errors': {
      loader: () => import('../utils/errors'),
      dependencies: [],
      preload: true
    }
  },

  // 集成模块懒加载配置
  integrations: {
    'stream.tracking': {
      loader: () => import('./TrackingIntegration'),
      dependencies: [],
      preload: false
    }
  }
};

/**
 * 注册Stream模块到UniversalModule系统
 */
export function registerStreamModule(universalModule: any, config: StreamUniversalConfig = {}): void {
  const streamConfig = createStreamUniversalConfig(config);
  
  // 注册模块
  universalModule.register(streamConfig);
  
  // 注册懒加载配置
  if (universalModule.lazyLoader) {
    Object.entries(STREAM_LAZY_LOAD_CONFIG.components).forEach(([name, config]) => {
      universalModule.lazyLoader.register(name, config);
    });
    
    Object.entries(STREAM_LAZY_LOAD_CONFIG.utils).forEach(([name, config]) => {
      universalModule.lazyLoader.register(name, config);
    });
    
    Object.entries(STREAM_LAZY_LOAD_CONFIG.integrations).forEach(([name, config]) => {
      universalModule.lazyLoader.register(name, config);
    });
  }
}