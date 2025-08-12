const runJavaScript = (bundleText: string) => {
  // 检测模块类型
  const isUMD = /^(var |\(function\()/.test(bundleText.trim());
  const isAMD = /^define\(/.test(bundleText.trim());

  // 创建临时环境
  const sandbox = {
    exports: {},
    module: { exports: {} },
    define: function() { /* AMD处理逻辑 */ }
  };

  if (isAMD) {
    // AMD模块特殊处理
    new Function('define', bundleText)(sandbox.define);
    return sandbox.module.exports;
  }
  else if (isUMD) {
    // UMD模块执行（保持原始结构）
    const wrapper = `
      (function(global, factory) {
        return typeof module === 'object' ?
          factory(module.exports, require) :
          factory(global);
      })(this, ${bundleText});
    `;
    return new Function('exports', 'require', 'module', wrapper)(
      sandbox.exports,
      require,
      sandbox.module
    );
  }
  else {
    // 普通模块（ESM/CJS）
    return new Function('exports', 'module', bundleText)(
      sandbox.exports,
      sandbox.module
    );
  }
};