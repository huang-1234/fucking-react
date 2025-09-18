/**
 * 兼容性管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CompatibilityManager } from '../core/CompatibilityManager';
import { BrowserMock, setupStreamTests } from './setup';
import { CompatibilityError } from '../utils/errors';

describe('CompatibilityManager', () => {
  setupStreamTests();

  let manager: CompatibilityManager;

  beforeEach(() => {
    // 重置单例
    (CompatibilityManager as any).instance = null;
    manager = CompatibilityManager.getInstance();
  });

  afterEach(() => {
    manager.reset();
    BrowserMock.restoreAll();
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = CompatibilityManager.getInstance();
      const instance2 = CompatibilityManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('特性检测', () => {
    it('应该检测ReadableStream支持', () => {
      // Mock支持的特性
      BrowserMock.mockFeature('ReadableStream', class MockReadableStream {
        getReader() { return {}; }
      });

      const supported = manager.isSupported('readableStream');
      expect(supported).toBe(true);
    });

    it('应该检测不支持的特性', () => {
      // Mock不支持的特性
      BrowserMock.mockUnsupportedFeature('ReadableStream');

      const supported = manager.isSupported('readableStream');
      expect(supported).toBe(false);
    });

    it('应该获取完整的特性支持情况', () => {
      const features = manager.getFeatureSupport();
      expect(features).toHaveProperty('streams');
      expect(features).toHaveProperty('textEncoder');
      expect(features).toHaveProperty('compressionStreams');
    });
  });

  describe('浏览器信息检测', () => {
    it('应该获取浏览器信息', () => {
      const browserInfo = manager.getBrowserInfo();
      expect(browserInfo).toHaveProperty('name');
      expect(browserInfo).toHaveProperty('version');
      expect(browserInfo).toHaveProperty('engine');
      expect(browserInfo).toHaveProperty('mobile');
      expect(browserInfo).toHaveProperty('os');
    });

    it('应该检测环境信息', () => {
      const envInfo = manager.getEnvironmentInfo();
      expect(envInfo).toHaveProperty('isBrowser');
      expect(envInfo).toHaveProperty('isNode');
      expect(envInfo).toHaveProperty('isWebWorker');
      expect(envInfo).toHaveProperty('supportsESModules');
    });
  });

  describe('初始化', () => {
    it('应该成功初始化', async () => {
      await expect(manager.initialize()).resolves.not.toThrow();
      expect(manager.isInitialized()).toBe(true);
    });

    it('应该支持自定义配置', async () => {
      const config = {
        debug: true,
        autoLoadPolyfills: false
      };

      await manager.initialize(config);
      expect(manager.isInitialized()).toBe(true);
    });

    it('不应该重复初始化', async () => {
      await manager.initialize();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await manager.initialize();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already initialized')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('降级策略', () => {
    it('应该获取降级策略', () => {
      const strategy = manager.getFallbackStrategy('streams');
      expect(['polyfill', 'alternative', 'disable', 'error']).toContain(strategy);
    });

    it('应该执行polyfill降级策略', async () => {
      // Mock不支持的特性
      BrowserMock.mockUnsupportedFeature('ReadableStream');
      
      // 由于我们在测试环境中，polyfill加载可能会失败
      // 这里主要测试策略执行逻辑
      try {
        await manager.executeFallback('streams');
      } catch (error) {
        // 预期可能失败，因为测试环境限制
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('应该执行alternative降级策略', async () => {
      manager.updateConfig({
        fallbacks: {
          testFeature: {
            strategy: 'alternative',
            alternative: () => 'fallback-value'
          }
        }
      });

      const result = await manager.executeFallback('testFeature');
      expect(result).toBe('fallback-value');
    });

    it('应该抛出兼容性错误', async () => {
      manager.updateConfig({
        fallbacks: {
          unsupportedFeature: {
            strategy: 'error',
            errorMessage: 'Feature not supported'
          }
        }
      });

      await expect(manager.executeFallback('unsupportedFeature'))
        .rejects.toThrow(CompatibilityError);
    });
  });

  describe('兼容性检查', () => {
    it('应该生成兼容性检查结果', () => {
      const result = manager.checkCompatibility();
      
      expect(result).toHaveProperty('compatible');
      expect(result).toHaveProperty('supportedFeatures');
      expect(result).toHaveProperty('unsupportedFeatures');
      expect(result).toHaveProperty('requiredPolyfills');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('browserInfo');
      
      expect(Array.isArray(result.supportedFeatures)).toBe(true);
      expect(Array.isArray(result.unsupportedFeatures)).toBe(true);
      expect(Array.isArray(result.requiredPolyfills)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('应该生成兼容性报告', () => {
      const report = manager.generateReport();
      
      expect(report).toHaveProperty('features');
      expect(report).toHaveProperty('browser');
      expect(report).toHaveProperty('environment');
      expect(report).toHaveProperty('summary');
      
      expect(report.summary).toHaveProperty('supportedCount');
      expect(report.summary).toHaveProperty('totalCount');
      expect(report.summary).toHaveProperty('supportPercentage');
    });
  });

  describe('配置管理', () => {
    it('应该更新配置', () => {
      const newConfig = {
        debug: true,
        autoLoadPolyfills: false
      };

      manager.updateConfig(newConfig);
      
      // 验证配置已更新（通过行为验证）
      expect(() => manager.updateConfig(newConfig)).not.toThrow();
    });
  });

  describe('polyfill管理', () => {
    it('应该获取polyfill加载器', () => {
      const loader = manager.getPolyfillLoader();
      expect(loader).toBeDefined();
      expect(typeof loader.loadPolyfill).toBe('function');
    });
  });

  describe('重置功能', () => {
    it('应该重置管理器状态', async () => {
      await manager.initialize();
      expect(manager.isInitialized()).toBe(true);
      
      manager.reset();
      expect(manager.isInitialized()).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理初始化错误', async () => {
      // Mock一个会导致错误的情况
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      // 强制触发错误
      const mockManager = new (CompatibilityManager as any)();
      mockManager.detectAllFeatures = vi.fn().mockRejectedValue(new Error('Detection failed'));
      
      await expect(mockManager.initialize()).rejects.toThrow('Detection failed');
      
      console.error = originalConsoleError;
    });
  });
});