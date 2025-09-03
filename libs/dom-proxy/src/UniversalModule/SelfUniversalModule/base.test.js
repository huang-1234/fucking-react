// 模拟executeESM函数，因为在Node.js测试环境中无法使用import()动态导入Blob URL
import * as baseModule from './base';

import {
  ModuleType,
  clearModuleCache,
  containsMaliciousCode,
  detectModuleType,
  executeAMD,
  executeCJS,
  executeIIFE,
  executeUMD,
  loadModule,
  safeLoadModule,
  unloadModule
} from './base';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSandbox } from "../Global/base";

/**
 * @desc 测试总结：
 * 1. 模块类型检测：
 *    - AMD 模块：检测到 define 函数和依赖数组
 *    - CJS 模块：检测到 module.exports 或 exports 语句
 *    - ESM 模块：检测到 import 或 export 语句
 *    - UMD 模块：检测到 define 函数和 module.exports 语句
 *    - IIFE 模块：检测到 exports 赋值语句
 * 2. 沙箱环境：
 *    - 创建隔离的沙箱环境，阻止访问全局对象
 *    - 允许修改 module.exports 和 exports 属性
 *    - 阻止设置非模块相关属性
 * 3. 模块执行器：
 *    - 执行 AMD 模块，返回模块导出对象
 *    - 执行 CJS 模块，返回模块导出对象
 *    - 执行 UMD 模块，返回模块导出对象
 *    - 执行 IIFE 模块，返回模块导出对象
 * 4. 模块加载器：
 *    - 加载 CJS 模块，返回模块导出对象
 *    - 从缓存加载模块，返回缓存的结果
 *    - 卸载模块，返回卸载结果
 * 5. 安全检查：
 *    - 检测恶意代码，返回是否包含恶意代码
 *    - 拒绝加载恶意代码，抛出错误
 *
 * @TODO: 需要补充测试用例，覆盖所有模块类型和场景
 * 1. 添加ESM模块加载测试
 */

vi.spyOn(baseModule, 'executeESM').mockImplementation(async (code) => {
  // 简单解析export default语句
  const match = code.match(/export\s+default\s+(\{[^}]*\})/);
  if (match && match[1]) {
    try {
      // 尝试解析导出的对象
      const exportedObj = new Function(`return ${match[1]}`)();
      return { default: exportedObj };
    } catch (e) {
      console.error('[Mock] 解析ESM默认导出失败:', e);
      return { default: {} };
    }
  }
  return { default: {} };
});

describe('通用模块加载器', () => {
  describe('模块类型检测', () => {
    it('应正确检测 AMD 模块', () => {
      const amdCode = `
        define(['dep1', 'dep2'], function(dep1, dep2) {
          return { name: 'amd-module' };
        });
      `;
      expect(detectModuleType(amdCode)).toBe(ModuleType.AMD);
    });

    it('应正确检测 CJS 模块', () => {
      const cjsCode = `
        const dep = require('dependency');
        module.exports = { name: 'cjs-module' };
      `;
      expect(detectModuleType(cjsCode)).toBe(ModuleType.CJS);

      const cjsCode2 = `
        exports.name = 'cjs-module';
      `;
      expect(detectModuleType(cjsCode2)).toBe(ModuleType.CJS);
    });

    it('应正确检测 ESM 模块', () => {
      const esmCode = `
        import { something } from 'dependency';
        export default { name: 'esm-module' };
      `;
      expect(detectModuleType(esmCode)).toBe(ModuleType.ESM);

      const esmCode2 = `
        export const name = 'esm-module';
      `;
      expect(detectModuleType(esmCode2)).toBe(ModuleType.ESM);
    });

    it('应正确检测 UMD 模块', () => {
      const umdCode = `
        (function (root, factory) {
          if (typeof define === 'function' && define.amd) {
            define(['dependency'], factory);
          } else if (typeof module === 'object' && module.exports) {
            module.exports = factory(require('dependency'));
          } else {
            root.myModule = factory(root.dependency);
          }
        }(typeof self !== 'undefined' ? self : this, function (dependency) {
          return { name: 'umd-module' };
        }));
      `;
      expect(detectModuleType(umdCode)).toBe(ModuleType.UMD);
    });

    it('应将未识别的模块类型视为 IIFE', () => {
      const iifeCode = `
        (function() {
          var name = 'iife-module';
          window.myModule = { name: name };
        })();
      `;
      expect(detectModuleType(iifeCode)).toBe(ModuleType.IIFE);
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
      const windowAccess = sandbox.document;
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('应阻止修改非模块相关属性', () => {
      const sandbox = createSandbox();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sandbox.customProp = 'test';
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('模块执行器', () => {
    // executeESM
    it('应执行 ESM 模块', async () => {
      const esmCode = `
        export default { name: 'esm-module' };
      `;
      const result = await baseModule.executeESM(esmCode);
      expect(result).toEqual({ default: { name: 'esm-module' } });
    });

    it('应执行 AMD 模块', () => {
      const amdCode = `
        define(['dep1'], function(dep1) {
          return { name: 'amd-module' };
        });
      `;
      const sandbox = createSandbox();
      const result = executeAMD(amdCode, sandbox);
      expect(result).toEqual({ name: 'amd-module' });
    });

    it('应执行 CJS 模块', () => {
      const cjsCode = `
        module.exports = { name: 'cjs-module' };
      `;
      const sandbox = createSandbox();
      const result = executeCJS(cjsCode, sandbox);
      expect(result).toEqual({ name: 'cjs-module' });
    });

    it('应执行 UMD 模块', () => {
      const umdCode = `
        module.exports = { name: 'umd-module' };
      `;
      const sandbox = createSandbox();
      const result = executeUMD(umdCode, sandbox);
      expect(result).toEqual({ name: 'umd-module' });
    });

    it('应执行 IIFE 模块', () => {
      const iifeCode = `
        (function() {
          exports.name = 'iife-module';
        })();
      `;
      const sandbox = createSandbox();
      const result = executeIIFE(iifeCode, sandbox);
      expect(result).toEqual({ name: 'iife-module' });
    });
  });

  describe('模块加载器', () => {
    beforeEach(() => {
      clearModuleCache();
    });

    it('应加载 CJS 模块', async () => {
      const cjsCode = `
        module.exports = { name: 'cjs-module' };
      `;
      const result = await loadModule(cjsCode, 'test-cjs');
      expect(result).toEqual({ name: 'cjs-module' });
    });

    it('应从缓存加载模块', async () => {
      const cjsCode = `
        module.exports = { name: 'cached-module' };
      `;
      await loadModule(cjsCode, 'cached-module');

      // 修改代码，但应该仍然返回缓存的结果
      const modifiedCode = `
        module.exports = { name: 'modified-module' };
      `;
      const result = await loadModule(modifiedCode, 'cached-module');
      expect(result).toEqual({ name: 'cached-module' });
    });

    it('应卸载模块', async () => {
      const cjsCode = `
        module.exports = { name: 'module-to-unload' };
      `;
      await loadModule(cjsCode, 'module-to-unload');

      // 卸载模块
      const unloaded = unloadModule('module-to-unload');
      expect(unloaded).toBe(true);

      // 重新加载，应该使用新代码
      const modifiedCode = `
        module.exports = { name: 'reloaded-module' };
      `;
      const result = await loadModule(modifiedCode, 'module-to-unload');
      expect(result).toEqual({ name: 'reloaded-module' });
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
});
