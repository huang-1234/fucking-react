/**
 * 兼容性管理器
 * 负责检测浏览器特性支持情况，管理polyfill加载，提供降级策略
 */

import type {
  FeatureSupport,
  BrowserInfo,
  EnvironmentInfo,
  CompatibilityConfig,
  CompatibilityCheckResult,
  FallbackStrategy,
  FallbackConfig
} from '../types/compatibility';

import {
  detectFeatures,
  detectFeature,
  getBrowserInfo,
  getEnvironmentInfo,
  checkMinVersion,
  generateCompatibilityReport,
  featureCache
} from '../utils/detection';

import {
  PolyfillLoader,
  createPolyfillLoader,
  conditionalLoadPolyfill,
  BUILTIN_POLYFILLS
} from '../utils/polyfills';

import { CompatibilityError } from '../utils/errors';

/**
 * 默认降级配置
 */
const DEFAULT_FALLBACKS: Record<string, FallbackConfig> = {
  streams: {
    strategy: 'polyfill',
    polyfillUrl: 'https://unpkg.com/web-streams-polyfill@4.0.0/dist/polyfill.js',
    showWarning: true
  },
  compressionStreams: {
    strategy: 'alternative',
    alternative: () => {
      // 提供JavaScript实现的压缩算法
      console.warn('[CompatibilityManager] Using JavaScript compression fallback');
      return null;
    },
    showWarning: true
  },
  textEncoder: {
    strategy: 'polyfill',
    polyfillUrl: 'https://unpkg.com/text-encoding@0.7.0/lib/encoding.js',
    showWarning: true
  },
  webSocketBinary: {
    strategy: 'alternative',
    alternative: () => {
      // 使用Base64编码作为降级方案
      console.warn('[CompatibilityManager] Using Base64 encoding for WebSocket binary data');
      return 'base64';
    },
    showWarning: true
  },
  arrayBufferTransfer: {
    strategy: 'alternative',
    alternative: () => {
      // 使用structuredClone或手动复制
      if (typeof globalThis.structuredClone === 'function') {
        return globalThis.structuredClone;
      }
      return (obj: any) => JSON.parse(JSON.stringify(obj));
    },
    showWarning: true
  }
};

/**
 * 兼容性管理器类
 */
export class CompatibilityManager {
  private static instance: CompatibilityManager | null = null;

  private config: CompatibilityConfig;
  private polyfillLoader: PolyfillLoader;
  private features: FeatureSupport | null = null;
  private browserInfo: BrowserInfo | null = null;
  private environmentInfo: EnvironmentInfo | null = null;
  private initialized = false;
  constructor(config: CompatibilityConfig = {}) {
    this.config = {
      autoLoadPolyfills: true,
      polyfillCDN: 'https://unpkg.com',
      fallbacks: { ...DEFAULT_FALLBACKS },
      debug: false,
      minVersions: {
        chrome: '73',
        firefox: '65',
        safari: '14',
        edge: '79'
      },
      ...config
    };

    this.polyfillLoader = createPolyfillLoader(this.config);
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: CompatibilityConfig): CompatibilityManager {
    if (!CompatibilityManager.instance) {
      CompatibilityManager.instance = new CompatibilityManager(config);
    }
    return CompatibilityManager.instance;
  }

  /**
   * 初始化兼容性管理器
   */
  async initialize(config?: CompatibilityConfig): Promise<void> {
    if (this.initialized) {
      if (this.config.debug) {
        console.warn('[CompatibilityManager] Already initialized');
      }
      return;
    }

    // 更新配置
    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // 检测特性支持
      await this.detectAllFeatures();

      // 自动加载polyfill
      if (this.config.autoLoadPolyfills) {
        await this.autoLoadPolyfills();
      }

      this.initialized = true;

      if (this.config.debug) {
        console.log('[CompatibilityManager] Initialized successfully', {
          features: this.features,
          browser: this.browserInfo,
          environment: this.environmentInfo
        });
      }

    } catch (error) {
      console.error('[CompatibilityManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 检测所有特性
   */
  private async detectAllFeatures(): Promise<void> {
    // 尝试从缓存获取
    const cacheKey = 'compatibility-features';
    const cached = featureCache.get(cacheKey);

    if (cached) {
      this.features = cached.features;
      this.browserInfo = cached.browserInfo;
      this.environmentInfo = cached.environmentInfo;
      return;
    }

    // 执行检测
    this.features = detectFeatures();
    this.browserInfo = getBrowserInfo();
    this.environmentInfo = getEnvironmentInfo();

    // 缓存结果
    featureCache.set(cacheKey, {
      features: this.features,
      browserInfo: this.browserInfo,
      environmentInfo: this.environmentInfo
    });
  }

  /**
   * 自动加载必需的polyfill
   */
  private async autoLoadPolyfills(): Promise<void> {
    if (!this.features) {
      throw new Error('Features not detected yet');
    }

    const requiredPolyfills: string[] = [];

    // 检查各种特性并确定需要的polyfill
    if (!this.features.streams) {
      requiredPolyfills.push('web-streams');
    }

    if (!this.features.textEncoder || !this.features.textDecoder) {
      requiredPolyfills.push('text-encoding');
    }

    if (!this.features.structuredClone) {
      requiredPolyfills.push('structured-clone');
    }

    // 加载polyfill
    if (requiredPolyfills.length > 0) {
      if (this.config.debug) {
        console.log('[CompatibilityManager] Loading polyfills:', requiredPolyfills);
      }

      try {
        await this.polyfillLoader.loadPolyfills(requiredPolyfills);

        // 重新检测特性
        this.features = detectFeatures();

      } catch (error) {
        console.error('[CompatibilityManager] Failed to load polyfills:', error);
        // 不抛出错误，继续使用降级方案
      }
    }
  }

  /**
   * 检查特性是否支持
   */
  isSupported(feature: keyof FeatureSupport): boolean {
    if (!this.features) {
      // 如果还未初始化，进行实时检测
      return detectFeature(feature);
    }
    return this.features[feature];
  }

  /**
   * 获取特性支持情况
   */
  getFeatureSupport(): FeatureSupport {
    if (!this.features) {
      return detectFeatures();
    }
    return { ...this.features };
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    if (!this.browserInfo) {
      this.browserInfo = getBrowserInfo();
    }
    return { ...this.browserInfo };
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo(): EnvironmentInfo {
    if (!this.environmentInfo) {
      this.environmentInfo = getEnvironmentInfo();
    }
    return { ...this.environmentInfo };
  }

  /**
   * 获取降级策略
   */
  getFallbackStrategy(feature: string): FallbackStrategy {
    const fallbackConfig = this.config.fallbacks?.[feature];
    return fallbackConfig?.strategy || 'error';
  }

  /**
   * 执行降级策略
   */
  async executeFallback(feature: string): Promise<any> {
    const fallbackConfig = this.config.fallbacks?.[feature];
    if (!fallbackConfig) {
      throw new CompatibilityError(feature, this.browserInfo?.name);
    }

    if (fallbackConfig.showWarning && this.config.debug) {
      console.warn(`[CompatibilityManager] Using fallback for ${feature}`);
    }

    switch (fallbackConfig.strategy) {
      case 'polyfill':
        if (fallbackConfig.polyfillUrl) {
          await this.polyfillLoader.loadPolyfill(feature);
          return true;
        }
        throw new CompatibilityError(feature, this.browserInfo?.name);

      case 'alternative':
        if (fallbackConfig.alternative) {
          return fallbackConfig.alternative();
        }
        throw new CompatibilityError(feature, this.browserInfo?.name);

      case 'disable':
        return null;

      case 'error':
      default:
        throw new CompatibilityError(
          feature,
          this.browserInfo?.name,
          new Error(fallbackConfig.errorMessage || `Feature ${feature} not supported`)
        );
    }
  }

  /**
   * 检查兼容性
   */
  checkCompatibility(): CompatibilityCheckResult {
    const features = this.getFeatureSupport();
    const browser = this.getBrowserInfo();
    const environment = this.getEnvironmentInfo();

    const supportedFeatures: (keyof FeatureSupport)[] = [];
    const unsupportedFeatures: (keyof FeatureSupport)[] = [];
    const requiredPolyfills: string[] = [];
    const warnings: string[] = [];

    // 检查各个特性
    for (const [feature, supported] of Object.entries(features)) {
      if (supported) {
        supportedFeatures.push(feature as keyof FeatureSupport);
      } else {
        unsupportedFeatures.push(feature as keyof FeatureSupport);

        // 检查是否有对应的polyfill
        if (BUILTIN_POLYFILLS[feature]) {
          requiredPolyfills.push(feature);
        } else {
          warnings.push(`No polyfill available for ${feature}`);
        }
      }
    }

    // 检查最小版本要求
    if (this.config.minVersions) {
      const meetsMinVersion = checkMinVersion(browser, this.config.minVersions);
      if (!meetsMinVersion) {
        warnings.push(`Browser version ${browser.version} may not be fully supported`);
      }
    }

    const compatible = unsupportedFeatures.length === 0 || requiredPolyfills.length > 0;

    return {
      compatible,
      supportedFeatures,
      unsupportedFeatures,
      requiredPolyfills,
      warnings,
      browserInfo: browser
    };
  }

  /**
   * 生成兼容性报告
   */
  generateReport(): ReturnType<typeof generateCompatibilityReport> {
    return generateCompatibilityReport();
  }

  /**
   * 重置管理器状态
   */
  reset(): void {
    this.features = null;
    this.browserInfo = null;
    this.environmentInfo = null;
    this.initialized = false;
    this.polyfillLoader.clear();
    featureCache.clear();
  }

  /**
   * 获取polyfill加载器
   */
  getPolyfillLoader(): PolyfillLoader {
    return this.polyfillLoader;
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CompatibilityConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * 创建兼容性管理器实例
 */
export function createCompatibilityManager(config?: CompatibilityConfig): CompatibilityManager {
  return CompatibilityManager.getInstance(config);
}

/**
 * 获取默认兼容性管理器实例
 */
export function getDefaultCompatibilityManager(): CompatibilityManager {
  return CompatibilityManager.getInstance();
}