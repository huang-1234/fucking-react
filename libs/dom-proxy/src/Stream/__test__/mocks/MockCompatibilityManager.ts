/**
 * 兼容性管理器的Mock实现
 * 用于测试时模拟兼容性检测结果
 */

import { CompatibilityManager } from '../../core/CompatibilityManager';
import { FeatureSupport, BrowserInfo, EnvironmentInfo } from '../../types';

/**
 * Mock兼容性管理器
 */
export class MockCompatibilityManager {
  private static instance: MockCompatibilityManager;
  private originalManager: CompatibilityManager;
  private mockFeatures: Partial<FeatureSupport> = {};
  private initialized = false;

  /**
   * 获取单例实例
   */
  static getInstance(): MockCompatibilityManager {
    if (!MockCompatibilityManager.instance) {
      MockCompatibilityManager.instance = new MockCompatibilityManager();
    }
    return MockCompatibilityManager.instance;
  }

  /**
   * 私有构造函数
   */
  private constructor() {
    // 保存原始兼容性管理器
    this.originalManager = CompatibilityManager.getInstance();
  }

  /**
   * 安装Mock
   */
  install(): void {
    // 重写CompatibilityManager.getInstance方法
    const self = this;
    const originalGetInstance = CompatibilityManager.getInstance;

    // @ts-ignore - 重写静态方法
    CompatibilityManager.getInstance = function() {
      return {
        isSupported: (feature: keyof FeatureSupport) => self.isSupported(feature),
        getFeatureSupport: () => self.getFeatureSupport(),
        getBrowserInfo: () => self.getBrowserInfo(),
        getEnvironmentInfo: () => self.getEnvironmentInfo(),
        initialize: () => self.initialize(),
        isInitialized: () => self.isInitialized(),
        reset: () => self.reset(),
        checkCompatibility: () => self.checkCompatibility(),
        generateReport: () => self.generateReport(),
        executeFallback: () => Promise.resolve(),
        getFallbackStrategy: () => 'polyfill',
        getPolyfillLoader: () => ({
          loadPolyfill: () => Promise.resolve(true)
        }),
        updateConfig: () => {}
      } as any;
    };
  }

  /**
   * 卸载Mock
   */
  uninstall(): void {
    // 恢复原始CompatibilityManager.getInstance方法
    // @ts-ignore - 重写静态方法
    CompatibilityManager.getInstance = function() {
      return CompatibilityManager.instance;
    };
  }

  /**
   * 模拟特性支持
   */
  mockFeature(feature: keyof FeatureSupport, supported: boolean): void {
    this.mockFeatures[feature] = supported;
  }

  /**
   * 模拟所有特性支持
   */
  mockAllFeatures(supported: boolean): void {
    const features: (keyof FeatureSupport)[] = [
      'streams',
      'readableStream',
      'writableStream',
      'transformStream',
      'compressionStreams',
      'textEncoder',
      'textDecoder',
      'webSocketBinary',
      'arrayBufferTransfer',
      'asyncIterator',
      'blobConstructor',
      'fileAPI',
      'structuredClone'
    ];

    features.forEach(feature => {
      this.mockFeatures[feature] = supported;
    });
  }

  /**
   * 重置所有模拟
   */
  resetMocks(): void {
    this.mockFeatures = {};
  }

  /**
   * 检查特性是否支持
   */
  isSupported(feature: keyof FeatureSupport): boolean {
    if (feature in this.mockFeatures) {
      return this.mockFeatures[feature] as boolean;
    }
    return this.originalManager.isSupported(feature);
  }

  /**
   * 获取所有特性支持情况
   */
  getFeatureSupport(): FeatureSupport {
    const originalFeatures = this.originalManager.getFeatureSupport();
    return {
      ...originalFeatures,
      ...this.mockFeatures
    } as FeatureSupport;
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    return this.originalManager.getBrowserInfo();
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo(): EnvironmentInfo {
    return this.originalManager.getEnvironmentInfo();
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 重置
   */
  reset(): void {
    this.initialized = false;
    this.mockFeatures = {};
  }

  /**
   * 检查兼容性
   */
  checkCompatibility() {
    const features = this.getFeatureSupport();

    const supportedFeatures = Object.entries(features)
      .filter(([_, supported]) => supported)
      .map(([feature]) => feature);

    const unsupportedFeatures = Object.entries(features)
      .filter(([_, supported]) => !supported)
      .map(([feature]) => feature);

    return {
      compatible: unsupportedFeatures.length === 0,
      supportedFeatures,
      unsupportedFeatures,
      requiredPolyfills: unsupportedFeatures,
      warnings: [],
      browserInfo: this.getBrowserInfo()
    };
  }

  /**
   * 生成兼容性报告
   */
  generateReport() {
    const features = this.getFeatureSupport();
    const browser = this.getBrowserInfo();
    const environment = this.getEnvironmentInfo();

    const supportedCount = Object.values(features).filter(Boolean).length;
    const totalCount = Object.keys(features).length;
    const supportPercentage = Math.round((supportedCount / totalCount) * 100);

    return {
      features,
      browser,
      environment,
      summary: {
        supportedCount,
        totalCount,
        supportPercentage
      }
    };
  }
}
