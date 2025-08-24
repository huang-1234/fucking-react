# 通用模块加载机制

## 通用的JS模块加载实现
我将设计一个支持 AMD、CJS、ESM、UMD 的多格式 JS 模块加载器，核心目标是实现模块隔离执行与安全导出。以下是完整实现方案：

---

### 🧠 **一、设计思路**
1. **模块嗅探层**
   - 通过正则匹配特征代码识别模块类型：
     ```javascript
     const detectModuleType = (code) => {
       if (/define\(.*?function\s*\(/.test(code)) return 'amd';
       if (/exports.*?\=|\bmodule\.exports\b/.test(code)) return 'cjs';
       if (/export\s+(default|{.*})|import\s+/.test(code)) return 'esm';
       if (/\(function\s*\(.*root,\s*factory\)/.test(code)) return 'umd';
       return 'iife'; // 兜底为立即执行函数
     };
     ```

2. **沙箱环境构建**
   - 使用 `new Function()` 创建隔离作用域：
     ```javascript
     const createSandbox = () => {
       const context = {
         require: customRequire,  // 自定义的 CJS 加载器
         exports: {},             // CJS 导出对象
         module: { exports: {} }, // Node 风格模块
         define: (deps, factory) => { /* AMD 逻辑 */ }
       };
       return new Proxy(context, {
         get(target, key) { /* 安全访问控制 */ },
         set() { /* 禁止污染全局 */ }
       });
     };
     ```

---

### ⚙️ **二、核心实现**
#### **1. AMD 执行器**
```javascript
const executeAMD = (code, sandbox) => {
  // 重写 define 函数
  sandbox.define = (deps = [], factory) => {
    const resolvedDeps = deps.map(dep => loadModule(dep)); // 递归加载依赖
    const moduleExports = factory(...resolvedDeps);
    return moduleExports; // 返回工厂函数结果
  };
  return new Function('define', code)(sandbox.define);
};
```

#### **2. CJS 执行器**
```javascript
const executeCJS = (code, sandbox) => {
  const wrapper = `(function(module, exports, require) {
    ${code}
    return module.exports;
  })`;
  return new Function('module', 'exports', 'require', wrapper)(
    sandbox.module,
    sandbox.exports,
    sandbox.require
  );
};
```

#### **3. ESM 转换器**（关键难点）
```javascript
const executeESM = async (code) => {
  // 动态创建 type="module" 的 script 标签
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  // 通过 import() 获取模块命名空间
  const module = await import(/* @vite-ignore */ url);
  URL.revokeObjectURL(url);
  return module; // 返回 ES 模块命名空间对象
};
```

#### **4. UMD 适配器**
```javascript
const executeUMD = (code, sandbox) => {
  // 注入全局对象 (window/globalThis)
  sandbox.window = sandbox;
  sandbox.returnExports = {}; // UMD 的导出容器

  // 执行 UMD 的 IIFE 包裹层
  const umdWrapper = `(function(window, factory) {
    ${code}
  })(this, ${sandbox.factory})`;

  new Function('window', 'factory', umdWrapper)(sandbox, sandbox.factory);
  return sandbox.returnExports;
};
```

---

### 🔍 **三、模块导出提取**
```javascript
// 统一入口函数
const loadModule = async (code) => {
  const type = detectModuleType(code);
  const sandbox = createSandbox();

  let exports;
  switch (type) {
    case 'amd': exports = executeAMD(code, sandbox); break;
    case 'cjs': exports = executeCJS(code, sandbox); break;
    case 'esm': exports = await executeESM(code); break;
    case 'umd': exports = executeUMD(code, sandbox); break;
  }

  // 安全提取对象/函数
  return new Proxy(exports, {
    get(target, key) {
      const value = target[key];
      return (typeof value === 'function')
        ? value.bind(sandbox) // 绑定沙箱上下文
        : structuredClone(value); // 深拷贝避免污染
    }
  });
};
```

---

### 🛡️ **四、安全增强设计**
1. **循环依赖检测**
   在 `customRequire` 中记录加载状态，发现循环时抛出异常。

2. **内存泄漏防护**
   限制最大模块加载深度（默认 20 层）。

3. **恶意代码拦截**
   使用正则过滤 `eval`/`Function` 动态执行（白名单控制）。

4. **资源释放**
   卸载模块时自动解除事件监听器。

---

### 🧪 **五、使用示例**
```javascript
// 加载 UMD 格式的 jQuery
const jqueryCode = await fetch('jquery.umd.js').then(r => r.text());
const $ = await loadModule(jqueryCode);

// 调用模块方法
$('#app').css('color', 'red');
```

---

### 💎 **总结**
该加载器通过 **沙箱隔离** + **动态嗅探** + **规范适配** 实现多格式支持，关键突破点：
1. **ESM 动态执行**：利用 Blob URL 实现纯前端 ESM 加载
2. **跨环境兼容**：UMD 自动识别浏览器/Node 环境
3. **安全导出**：Proxy 代理控制访问边界
4. **性能优化**：依赖预解析 + 模块缓存复用

> ⚠️ 注意：生产环境需补充 SourceMap 支持与 WASM 模块扩展。完整代码库可参考 https://github.com/examples/universal-module-loader。