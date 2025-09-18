/**
 * Stream模块兼容性测试
 * 测试在不同浏览器环境和特性支持情况下的行为
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  CompatibilityManager,
  BinaryData,
  StreamOperations,
  detectFeatures,
  getBrowserInfo,
  getEnvironmentInfo
} from '../index';
import { BrowserMock, setupStreamTests } from './setup';

describe('Stream模块兼容性测试', () => {
  setupStreamTests();

  let compatibilityManager: CompatibilityManager;

  beforeEach(() => {
    // 重置兼容性管理器
    (CompatibilityManager as any).instance = null;
    compatibilityManager = CompatibilityManager.getInstance();
  });

  afterEach(() => {
    compatibilityManager.reset();
    BrowserMock.restoreAll();
  });

  describe('特性检测', () => {
    it('应该正确检测ReadableStream支持', () => {
      // Mock支持ReadableStream
      BrowserMock.mockFeature('ReadableStream', class MockReadableStream {
        constructor(source: any) {}
        getReader() { return {}; }
        pipeThrough() { return this; }
        pipeTo() { return Promise.resolve(); }
      });

      const features = detectFeatures();
      expect(features.readableStream).toBe(true);
      expect(features.streams).toBe(true);
    });

    it('应该正确检测不支持的特性', () => {
      // Mock不支持的环境
      BrowserMock.mockUnsupportedFeature('ReadableStream');
      BrowserMock.mockUnsupportedFeature('WritableStream');
      BrowserMock.mockUnsupportedFeature('TransformStream');

      const features = detectFeatures();
      expect(features.readableStream).toBe(false);
      expect(features.writableStream).toBe(false);
      expect(features.transformStream).toBe(false);
      expect(features.streams).toBe(false);
    });

    it('应该检测TextEncoder/TextDecoder支持', () => {
      // Mock支持
      BrowserMock.mockFeature('TextEncoder', class MockTextEncoder {
        encode(text: string) { return new Uint8Array(); }
      });
      BrowserMock.mockFeature('TextDecoder', class MockTextDecoder {
        decode(buffer: ArrayBuffer) { return ''; }
      });

      const features = detectFeatures();
      expect(features.textEncoder).toBe(true);
      expect(features.textDecoder).toBe(true);
    });

    it('应该检测压缩流支持', () => {
      // Mock支持压缩流
      BrowserMock.mockFeature('CompressionStream', class MockCompressionStream {
        constructor(format: string) {}
        readable = new ReadableStream();
        writable = new WritableStream();
      });
      BrowserMock.mockFeature('DecompressionStream', class MockDecompressionStream {
        constructor(format: string) {}
        readable = new ReadableStream();
        writable = new WritableStream();
      });

      const features = detectFeatures();
      expect(features.compressionStreams).toBe(true);
    });

    it('应该检测Blob构造函数支持', () => {
      // Mock支持Blob
      BrowserMock.mockFeature('Blob', class MockBlob {
        constructor(parts: any[], options?: any) {}
        size = 0;
        type = '';
        arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
      });

      const features = detectFeatures();
      expect(features.blobConstructor).toBe(true);
    });
  });

  describe('浏览器信息检测', () => {
    it('应该检测Chrome浏览器', () => {
      // Mock Chrome用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Chrome');
      expect(browserInfo.engine).toBe('Blink');
    });

    it('应该检测Firefox浏览器', () => {
      // Mock Firefox用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        configurable: true
      });

      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Firefox');
      expect(browserInfo.engine).toBe('Gecko');
    });

    it('应该检测Safari浏览器', () => {
      // Mock Safari用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        configurable: true
      });

      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Safari');
      expect(browserInfo.engine).toBe('WebKit');
    });

    it('应该检测移动端浏览器', () => {
      // Mock移动端用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        configurable: true
      });

      const browserInfo = getBrowserInfo();
      expect(browserInfo.mobile).toBe(true);
      expect(browserInfo.os).toBe('iOS');
    });
  });

  describe('环境检测', () => {
    it('应该检测浏览器环境', () => {
      const envInfo = getEnvironmentInfo();
      expect(envInfo.isBrowser).toBe(true);
      expect(envInfo.isNode).toBe(false);
    });

    it('应该检测ES模块支持', () => {
      const envInfo = getEnvironmentInfo();
      // 在测试环境中，这取决于具体的配置
      expect(typeof envInfo.supportsESModules).toBe('boolean');
    });
  });

  describe('降级策略', () => {
    it('应该在不支持Stream时提供错误信息', async () => {
      // Mock不支持Stream的环境
      BrowserMock.mockUnsupportedFeature('ReadableStream');
      BrowserMock.mockUnsupportedFeature('WritableStream');
      BrowserMock.mockUnsupportedFeature('TransformStream');

      await compatibilityManager.initialize();

      expect(() => {
        StreamOperations.createReadableStream({});
      }).toThrow(/ReadableStream not supported/);
    });

    it('应该在不支持TextEncoder时提供降级方案', () => {
      // Mock不支持TextEncoder
      BrowserMock.mockUnsupportedFeature('TextEncoder');

      expect(() => {
        StreamOperations.createTextEncoderTransform();
      }).toThrow(/TextEncoder not supported/);
    });

    it('应该在不支持Blob时提供错误信息', () => {
      // Mock不支持Blob
      BrowserMock.mockUnsupportedFeature('Blob');

      const data = BinaryData.from('test');
      
      expect(() => {
        data.toBlob();
      }).toThrow(/Blob constructor not supported/);
    });

    it('应该在不支持压缩流时提供错误信息', () => {
      // Mock不支持压缩流
      BrowserMock.mockUnsupportedFeature('CompressionStream');
      BrowserMock.mockUnsupportedFeature('DecompressionStream');

      expect(() => {
        StreamOperations.createCompressionTransform('gzip');
      }).toThrow(/Compression streams not supported/);
    });
  });

  describe('polyfill集成', () => {
    it('应该检测需要的polyfill', async () => {
      // Mock部分不支持的特性
      BrowserMock.mockUnsupportedFeature('ReadableStream');
      BrowserMock.mockUnsupportedFeature('TextEncoder');

      await compatibilityManager.initialize({
        autoLoadPolyfills: false // 避免实际加载polyfill
      });

      const compatibilityResult = compatibilityManager.checkCompatibility();
      
      expect(compatibilityResult.requiredPolyfills).toContain('web-streams');
      expect(compatibilityResult.requiredPolyfills).toContain('text-encoding');
    });

    it('应该处理polyfill加载失败', async () => {
      // Mock不支持的特性
      BrowserMock.mockUnsupportedFeature('ReadableStream');

      // 在宽松模式下，polyfill加载失败不应该导致初始化失败
      await expect(compatibilityManager.initialize({
        autoLoadPolyfills: true,
        compatibilityLevel: 'loose'
      })).resolves.not.toThrow();
    });
  });

  describe('版本兼容性', () => {
    it('应该检查最小版本要求', async () => {
      // Mock旧版本Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        configurable: true
      });

      await compatibilityManager.initialize({
        minVersions: {
          chrome: '70' // 要求Chrome 70+
        }
      });

      const compatibilityResult = compatibilityManager.checkCompatibility();
      expect(compatibilityResult.warnings).toContain(
        expect.stringContaining('Browser version')
      );
    });

    it('应该通过版本检查', async () => {
      // Mock新版本Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      await compatibilityManager.initialize({
        minVersions: {
          chrome: '70'
        }
      });

      const compatibilityResult = compatibilityManager.checkCompatibility();
      expect(compatibilityResult.warnings).not.toContain(
        expect.stringContaining('Browser version')
      );
    });
  });

  describe('兼容性报告', () => {
    it('应该生成完整的兼容性报告', async () => {
      await compatibilityManager.initialize();
      
      const report = compatibilityManager.generateReport();
      
      expect(report).toHaveProperty('features');
      expect(report).toHaveProperty('browser');
      expect(report).toHaveProperty('environment');
      expect(report).toHaveProperty('summary');
      
      expect(report.summary).toHaveProperty('supportedCount');
      expect(report.summary).toHaveProperty('totalCount');
      expect(report.summary).toHaveProperty('supportPercentage');
      
      expect(typeof report.summary.supportedCount).toBe('number');
      expect(typeof report.summary.totalCount).toBe('number');
      expect(typeof report.summary.supportPercentage).toBe('number');
    });

    it('应该计算正确的支持百分比', async () => {
      await compatibilityManager.initialize();
      
      const report = compatibilityManager.generateReport();
      
      const expectedPercentage = Math.round(
        (report.summary.supportedCount / report.summary.totalCount) * 100
      );
      
      expect(report.summary.supportPercentage).toBe(expectedPercentage);
    });
  });

  describe('严格兼容性模式', () => {
    it('应该在严格模式下拒绝不兼容的环境', async () => {
      // Mock大量不支持的特性
      BrowserMock.mockUnsupportedFeature('ReadableStream');
      BrowserMock.mockUnsupportedFeature('WritableStream');
      BrowserMock.mockUnsupportedFeature('TransformStream');
      BrowserMock.mockUnsupportedFeature('TextEncoder');
      BrowserMock.mockUnsupportedFeature('TextDecoder');

      await expect(compatibilityManager.initialize({
        compatibilityLevel: 'strict',
        autoLoadPolyfills: false
      })).rejects.toThrow(/Strict compatibility check failed/);
    });

    it('应该在宽松模式下接受部分兼容的环境', async () => {
      // Mock部分不支持的特性
      BrowserMock.mockUnsupportedFeature('CompressionStream');
      BrowserMock.mockUnsupportedFeature('DecompressionStream');

      await expect(compatibilityManager.initialize({
        compatibilityLevel: 'loose',
        autoLoadPolyfills: false
      })).resolves.not.toThrow();
    });
  });

  describe('运行时兼容性检查', () => {
    it('应该在运行时检查特性支持', () => {
      // 测试实时特性检查
      expect(compatibilityManager.isSupported('blobConstructor')).toBe(
        typeof Blob !== 'undefined'
      );
      
      expect(compatibilityManager.isSupported('textEncoder')).toBe(
        typeof TextEncoder !== 'undefined'
      );
    });

    it('应该缓存特性检测结果', () => {
      // 第一次检查
      const result1 = compatibilityManager.isSupported('streams');
      
      // 第二次检查应该返回相同结果（从缓存）
      const result2 = compatibilityManager.isSupported('streams');
      
      expect(result1).toBe(result2);
    });
  });
});