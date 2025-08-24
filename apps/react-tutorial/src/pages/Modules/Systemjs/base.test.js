import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectModuleType,
  ModuleType,
  systemJSLoader,
  safeLoadModule,
  containsMaliciousCode,
  moduleExamples
} from './base';

import { createSandbox } from '../Global/base';
/**
 * SystemJS模块加载器测试套件
 * 测试模块类型检测、沙箱环境、模块加载等功能
 */
describe('SystemJS模块加载器', () => {
  // 模拟SystemJS的import方法
  beforeEach(() => {
    // 模拟SystemJS的importModule方法
    vi.spyOn(systemJSLoader, 'importModule').mockImplementation(async (url) => {
      console.log(`[Mock] 导入模块: ${url}`);

      // 根据URL中的模块类型返回不同的模拟导出
      if (url.includes('amd')) {
        return { name: 'amd-module' };
      } else if (url.includes('cjs')) {
        return { name: 'cjs-module' };
      } else if (url.includes('esm')) {
        return { default: { name: 'esm-module' } };
      } else if (url.includes('umd')) {
        return { name: 'umd-module' };
      } else if (url.includes('iife')) {
        return { name: 'iife-module' };
      }

      return { name: 'default-module' };
    });

    // 模拟URL.createObjectURL和URL.revokeObjectURL
    global.URL = {
      createObjectURL: vi.fn().mockImplementation(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    };

    // 模拟Blob
    global.Blob = vi.fn().mockImplementation(() => ({}));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('模块类型检测', () => {
    it('应正确检测 AMD 模块', () => {
      expect(detectModuleType(moduleExamples.amd)).toBe(ModuleType.AMD);
    });

    it('应正确检测 CJS 模块', () => {
      expect(detectModuleType(moduleExamples.cjs)).toBe(ModuleType.CJS);
    });

    it('应正确检测 ESM 模块', () => {
      expect(detectModuleType(moduleExamples.esm)).toBe(ModuleType.ESM);
    });

    it('应正确检测 UMD 模块', () => {
      expect(detectModuleType(moduleExamples.umd)).toBe(ModuleType.UMD);
    });

    it('应将未识别的模块类型视为 IIFE', () => {
      expect(detectModuleType(moduleExamples.iife)).toBe(ModuleType.IIFE);
    });
  });

  describe('沙箱环境', () => {
    it('应创建隔离的沙箱环境', () => {
      const sandbox = createSandbox();
      expect(sandbox.module).toBeDefined();
      expect(sandbox.exports).toBeDefined();
      expect(sandbox.require).toBeDefined();
    });

    it('应阻止访问全局对象', () => {
      const sandbox = createSandbox();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 测试访问不在沙箱中定义的全局对象
      const documentAccess = sandbox.document;
      expect(consoleSpy).toHaveBeenCalled();
      expect(documentAccess).toEqual({});

      consoleSpy.mockRestore();
    });

    it('应允许修改module.exports', () => {
      const sandbox = createSandbox();
      sandbox.module.exports = { test: 'value' };
      expect(sandbox.module.exports).toEqual({ test: 'value' });
    });
  });

  describe('模块加载', () => {
    it('应加载 AMD 模块', async () => {
      const result = await safeLoadModule(moduleExamples.amd, 'test-amd');
      expect(result).toBeDefined();
    });

    it('应加载 CJS 模块', async () => {
      const result = await safeLoadModule(moduleExamples.cjs, 'test-cjs');
      expect(result).toBeDefined();
    });

    it('应加载 ESM 模块', async () => {
      const result = await safeLoadModule(moduleExamples.esm, 'test-esm');
      expect(result).toBeDefined();
    });

    it('应加载 UMD 模块', async () => {
      const result = await safeLoadModule(moduleExamples.umd, 'test-umd');
      expect(result).toBeDefined();
    });

    it('应加载 IIFE 模块', async () => {
      const result = await safeLoadModule(moduleExamples.iife, 'test-iife');
      expect(result).toBeDefined();
    });

    it('应从缓存加载模块', async () => {
      // 首次加载
      await safeLoadModule(moduleExamples.cjs, 'cached-module');

      // 模拟importModule，检查是否从缓存加载
      const importSpy = vi.spyOn(systemJSLoader, 'importModule');

      // 再次加载
      await safeLoadModule(moduleExamples.cjs, 'cached-module');

      // 不应该再次调用importModule
      expect(importSpy).not.toHaveBeenCalled();
    });

    it('应卸载模块', async () => {
      // 加载模块
      await safeLoadModule(moduleExamples.cjs, 'module-to-unload');

      // 卸载模块
      const unloaded = systemJSLoader.unloadModule('module-to-unload');
      expect(unloaded).toBe(true);

      // 再次加载，应该重新调用importModule
      const importSpy = vi.spyOn(systemJSLoader, 'importModule');
      await safeLoadModule(moduleExamples.cjs, 'module-to-unload');
      expect(importSpy).toHaveBeenCalled();
    });
  });

  describe('安全检查', () => {
    it('应检测恶意代码', () => {
      expect(containsMaliciousCode('eval("alert(1)")')).toBe(true);
      expect(containsMaliciousCode('new Function("return window")')).toBe(true);
      expect(containsMaliciousCode('document.cookie = "hacked=true"')).toBe(true);
      expect(containsMaliciousCode('location = "evil.com"')).toBe(true);
      expect(containsMaliciousCode('window.open("phishing.com")')).toBe(true);

      expect(containsMaliciousCode('const x = 1; const y = 2;')).toBe(false);
    });

    it('应拒绝加载恶意代码', async () => {
      const maliciousCode = `
        eval("alert('hacked')");
      `;

      await expect(safeLoadModule(maliciousCode)).rejects.toThrow('检测到潜在的恶意代码');
    });
  });

  describe('循环依赖检测', () => {
    it('应检测循环依赖', async () => {
      // 模拟循环依赖
      vi.spyOn(systemJSLoader, 'checkCircularDependency').mockImplementation((moduleId) => {
        if (moduleId === 'circular-module') {
          throw new Error('检测到循环依赖: circular-module');
        }
      });

      await expect(safeLoadModule('const x = 1;', 'circular-module')).rejects.toThrow('检测到循环依赖');
    });
  });
});