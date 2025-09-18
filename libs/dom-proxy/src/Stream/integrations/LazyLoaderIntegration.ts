/**
 * 与LazyLoader的集成
 * 支持Stream模块的懒加载和资源优化
 */

/**
 * Stream模块懒加载配置
 */
export interface StreamLazyConfig {
  /** 预加载策略 */
  preloadStrategy?: 'none' | 'critical' | 'all';
  /** 加载超时时间 */
  loadTimeout?: number;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存过期时间 */
  cacheExpiry?: number;
  /** 是否启用调试 */
  debug?: boolean;
}

/**
 * Stream模块懒加载管理器
 */
export class StreamLazyLoader {
  private config: Required<StreamLazyConfig>;
  private loadedModules = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private moduleCache = new Map<string, { module: any; timestamp: number }>();

  constructor(config: StreamLazyConfig = {}) {
    this.config = {
      preloadStrategy: 'critical',
      loadTimeout: 10000,
      enableCache: true,
      cacheExpiry: 30 * 60 * 1000, // 30分钟
      debug: false,
      ...config
    };
  }

  /**
   * 初始化懒加载器
   */
  async initialize(): Promise<void> {
    if (this.config.debug) {
      console.log('[StreamLazyLoader] Initializing with strategy:', this.config.preloadStrategy);
    }

    // 根据策略预加载模块
    switch (this.config.preloadStrategy) {
      case 'critical':
        await this.preloadCritical();
        break;
      case 'all':
        await this.preloadAll();
        break;
      case 'none':
      default:
        // 不预加载
        break;
    }
  }

  /**
   * 预加载关键模块
   */
  private async preloadCritical(): Promise<void> {
    const criticalModules = [
      'compatibility',
      'detection',
      'errors'
    ];

    await Promise.all(
      criticalModules.map(module => this.loadModule(module))
    );
  }

  /**
   * 预加载所有模块
   */
  private async preloadAll(): Promise<void> {
    const allModules = [
      'compatibility',
      'detection',
      'errors',
      'polyfills',
      'binary-data',
      'stream-operations',
      'data-transfer'
    ];

    await Promise.all(
      allModules.map(module => this.loadModule(module))
    );
  }

  /**
   * 懒加载模块
   */
  async loadModule(moduleName: string): Promise<any> {
    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.getCachedModule(moduleName);
      if (cached) {
        return cached;
      }
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    // 开始加载
    const loadPromise = this.doLoadModule(moduleName);
    this.loadingPromises.set(moduleName, loadPromise);

    try {
      const module = await Promise.race([
        loadPromise,
        this.createTimeoutPromise(moduleName)
      ]);

      // 缓存模块
      if (this.config.enableCache) {
        this.cacheModule(moduleName, module);
      }

      this.loadedModules.add(moduleName);
      this.loadingPromises.delete(moduleName);

      if (this.config.debug) {
        console.log(`[StreamLazyLoader] Successfully loaded module: ${moduleName}`);
      }

      return module;

    } catch (error) {
      this.loadingPromises.delete(moduleName);
      
      if (this.config.debug) {
        console.error(`[StreamLazyLoader] Failed to load module ${moduleName}:`, error);
      }
      
      throw error;
    }
  }

  /**
   * 执行模块加载
   */
  private async doLoadModule(moduleName: string): Promise<any> {
    switch (moduleName) {
      case 'compatibility':
        return (await import('../core/CompatibilityManager')).CompatibilityManager;

      case 'detection':
        return await import('../utils/detection');

      case 'errors':
        return await import('../utils/errors');

      case 'polyfills':
        return await import('../utils/polyfills');

      case 'binary-data':
        return (await import('../core/BinaryData')).BinaryData;

      case 'stream-operations':
        return (await import('../core/StreamOperations')).StreamOperations;

      case 'data-transfer':
        return (await import('../core/DataTransfer')).DataTransfer;

      case 'tracking-integration':
        return await import('./TrackingIntegration');

      case 'universal-integration':
        return await import('./UniversalModuleIntegration');

      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise(moduleName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Module ${moduleName} load timeout after ${this.config.loadTimeout}ms`));
      }, this.config.loadTimeout);
    });
  }

  /**
   * 获取缓存的模块
   */
  private getCachedModule(moduleName: string): any | null {
    const cached = this.moduleCache.get(moduleName);
    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.config.cacheExpiry) {
      this.moduleCache.delete(moduleName);
      return null;
    }

    return cached.module;
  }

  /**
   * 缓存模块
   */
  private cacheModule(moduleName: string, module: any): void {
    this.moduleCache.set(moduleName, {
      module,
      timestamp: Date.now()
    });
  }

  /**
   * 检查模块是否已加载
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  /**
   * 获取已加载的模块列表
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [moduleName, cached] of this.moduleCache) {
      if (now - cached.timestamp > this.config.cacheExpiry) {
        this.moduleCache.delete(moduleName);
      }
    }
  }

  /**
   * 重置懒加载器
   */
  reset(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
    this.moduleCache.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    loadedModules: number;
    loadingModules: number;
    cachedModules: number;
    cacheHitRate: number;
  } {
    return {
      loadedModules: this.loadedModules.size,
      loadingModules: this.loadingPromises.size,
      cachedModules: this.moduleCache.size,
      cacheHitRate: 0 // 需要实际统计缓存命中率
    };
  }
}

/**
 * 资源优化器
 */
export class StreamResourceOptimizer {
  private loadedResources = new Set<string>();
  private resourceSizes = new Map<string, number>();

  /**
   * 分析资源使用情况
   */
  analyzeResourceUsage(): {
    totalResources: number;
    totalSize: number;
    averageSize: number;
    largestResource: { name: string; size: number } | null;
  } {
    const totalResources = this.loadedResources.size;
    const sizes = Array.from(this.resourceSizes.values());
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    const averageSize = totalSize / totalResources || 0;

    let largestResource: { name: string; size: number } | null = null;
    let maxSize = 0;

    for (const [name, size] of this.resourceSizes) {
      if (size > maxSize) {
        maxSize = size;
        largestResource = { name, size };
      }
    }

    return {
      totalResources,
      totalSize,
      averageSize,
      largestResource
    };
  }

  /**
   * 记录资源加载
   */
  recordResourceLoad(resourceName: string, size: number): void {
    this.loadedResources.add(resourceName);
    this.resourceSizes.set(resourceName, size);
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const analysis = this.analyzeResourceUsage();

    if (analysis.totalSize > 1024 * 1024) { // 1MB
      suggestions.push('Consider enabling lazy loading for large modules');
    }

    if (analysis.totalResources > 10) {
      suggestions.push('Consider bundling smaller modules together');
    }

    if (analysis.largestResource && analysis.largestResource.size > 500 * 1024) { // 500KB
      suggestions.push(`Consider splitting large module: ${analysis.largestResource.name}`);
    }

    return suggestions;
  }
}

/**
 * 全局Stream懒加载器实例
 */
let globalStreamLazyLoader: StreamLazyLoader | null = null;

/**
 * 获取全局Stream懒加载器
 */
export function getGlobalStreamLazyLoader(): StreamLazyLoader {
  if (!globalStreamLazyLoader) {
    globalStreamLazyLoader = new StreamLazyLoader();
  }
  return globalStreamLazyLoader;
}

/**
 * 设置全局Stream懒加载器
 */
export function setGlobalStreamLazyLoader(loader: StreamLazyLoader): void {
  globalStreamLazyLoader = loader;
}

/**
 * 创建Stream模块的LazyLoader配置
 */
export function createStreamLazyLoaderConfig(config: StreamLazyConfig = {}) {
  return {
    name: 'stream',
    loader: new StreamLazyLoader(config),
    modules: {
      // 核心模块
      'stream/compatibility': {
        path: '../core/CompatibilityManager',
        dependencies: [],
        preload: true,
        size: 15000 // 估算大小
      },
      'stream/binary-data': {
        path: '../core/BinaryData',
        dependencies: ['stream/compatibility'],
        preload: false,
        size: 25000
      },
      'stream/operations': {
        path: '../core/StreamOperations',
        dependencies: ['stream/binary-data'],
        preload: false,
        size: 30000
      },
      'stream/transfer': {
        path: '../core/DataTransfer',
        dependencies: ['stream/binary-data', 'stream/operations'],
        preload: false,
        size: 40000
      },

      // 工具模块
      'stream/utils': {
        path: '../utils',
        dependencies: [],
        preload: true,
        size: 20000
      },

      // 集成模块
      'stream/tracking': {
        path: './TrackingIntegration',
        dependencies: [],
        preload: false,
        size: 10000
      },
      'stream/universal': {
        path: './UniversalModuleIntegration',
        dependencies: ['stream/compatibility'],
        preload: false,
        size: 12000
      }
    }
  };
}