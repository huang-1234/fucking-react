import { loadModule, detectModuleType, ModuleType } from './base';

/**
 * AMD 模块示例
 */
export const amdModuleExample = `
define(['jquery', 'lodash'], function($, _) {
  function renderTemplate(template, data) {
    const compiled = _.template(template);
    return compiled(data);
  }

  function init(element) {
    $(element).html(renderTemplate('<div>Hello <%= name %></div>', { name: 'World' }));
  }

  return {
    init: init,
    renderTemplate: renderTemplate
  };
});
`;

/**
 * CommonJS 模块示例
 */
export const cjsModuleExample = `
const path = require('path');
const fs = require('fs');

function readConfig(configPath) {
  const fullPath = path.resolve(__dirname, configPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeConfig(configPath, data) {
  const fullPath = path.resolve(__dirname, configPath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

module.exports = {
  readConfig,
  writeConfig
};
`;

/**
 * ES 模块示例
 */
export const esmModuleExample = `
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
`;

/**
 * UMD 模块示例
 */
export const umdModuleExample = `
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // 浏览器全局变量
    root.Tooltip = factory(root.jQuery);
  }
}(typeof self !== 'undefined' ? self : this, function($) {

  function Tooltip(element, options) {
    this.element = $(element);
    this.options = $.extend({}, Tooltip.defaults, options);
    this.init();
  }

  Tooltip.defaults = {
    position: 'top',
    trigger: 'hover',
    content: ''
  };

  Tooltip.prototype.init = function() {
    // 初始化代码
    this.element.on(this.options.trigger === 'hover' ? 'mouseenter' : 'click', this.show.bind(this));
  };

  Tooltip.prototype.show = function() {
    // 显示提示框
    console.log('显示提示框:', this.options.content);
  };

  return Tooltip;
}));
`;

/**
 * IIFE 模块示例
 */
export const iifeModuleExample = `
(function(window, document, undefined) {
  'use strict';

  var Validator = {
    email: function(value) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
    },

    url: function(value) {
      return /^https?:\\/\\/[^\\s/$.?#].[^\\s]*$/.test(value);
    },

    required: function(value) {
      return value !== null && value !== undefined && value !== '';
    }
  };

  // 导出到全局
  window.Validator = Validator;

})(window, document);
`;

/**
 * 使用示例
 */
export const runExamples = async () => {
  console.log('--- 通用模块加载器示例 ---');

  // 检测模块类型
  console.log('AMD 模块类型:', detectModuleType(amdModuleExample));
  console.log('CJS 模块类型:', detectModuleType(cjsModuleExample));
  console.log('ESM 模块类型:', detectModuleType(esmModuleExample));
  console.log('UMD 模块类型:', detectModuleType(umdModuleExample));
  console.log('IIFE 模块类型:', detectModuleType(iifeModuleExample));

  // 加载 CJS 模块
  try {
    console.log('\n加载 CJS 模块:');
    const cjsModule = await loadModule(cjsModuleExample, 'cjs-example');
    console.log('CJS 模块导出:', cjsModule);
  } catch (error) {
    console.error('CJS 模块加载失败:', error);
  }

  // 加载 UMD 模块
  try {
    console.log('\n加载 UMD 模块:');
    const umdModule = await loadModule(umdModuleExample, 'umd-example');
    console.log('UMD 模块导出:', umdModule);
  } catch (error) {
    console.error('UMD 模块加载失败:', error);
  }

  // 注意：ESM 模块在浏览器环境中可能无法正常加载，因为 import() 需要有效的 URL
  console.log('\nESM 模块需要在支持 ES 模块的环境中加载');
};
