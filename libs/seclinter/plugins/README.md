# SecLinter 插件系统

SecLinter 插件系统是一个强大的扩展框架，允许开发者创建自定义安全检测和防护规则，并将其集成到各种开发环境中。

## 核心特点

- **解耦与扩展性**：核心系统只负责插件管理、生命周期调度和提供基础服务，具体的安全检测规则作为独立插件存在
- **安全第一**：插件系统提供隔离和容错机制，确保一个插件的崩溃或安全漏洞不会影响核心工具或其他插件的运行
- **约定优于配置**：提供清晰的接口规范、简单的开发模板和自动化工具，降低开发门槛
- **性能与可控性**：支持插件的按需加载和卸载，避免不必要的性能开销，同时监控插件的资源使用情况

## 架构设计

整个系统采用 **"内核 (Core) + 插件 (Plugin)"** 的架构，并引入 **沙箱 (Sandbox)** 机制来隔离插件运行环境。

| 系统层 | 职责 | 关键技术/实现 |
| :--- | :--- | :--- |
| **内核 (Core)** | 插件注册、生命周期管理、提供公共服务（如日志、配置、事件总线）、安全沙箱管理 | TypeScript 接口、依赖注入 |
| **插件 (Plugin)** | 实现具体的安全检测规则（如检测新的 XSS 向量、特定的敏感信息模式） | 实现标准接口、独立打包 |
| **沙箱 (Sandbox)** | 为插件提供隔离的执行环境，限制其访问权限，确保核心系统安全 | Node.js `vm` 模块、Proxy 代理 |

## 集成支持

SecLinter 插件系统支持多种集成方式：

- **Webpack 插件**：在构建过程中检测和修复安全问题
- **Vite 插件**：为 Vite 项目提供实时安全检测
- **浏览器扩展**：直接在浏览器中检测网页安全问题
- **VSCode 扩展**：在编辑器中提供实时安全检测和修复建议

## 示例插件

本仓库包含以下示例插件：

- **XSS 检测器**：检测代码中潜在的 XSS 漏洞
- **依赖检查器**：检查项目依赖中的已知安全漏洞

## 开发自定义插件

### 1. 创建新项目

```bash
mkdir seclinter-plugin-my-rule
cd seclinter-plugin-my-rule
npm init -y
```

### 2. 安装依赖

```bash
npm install --save-dev typescript
npm install --peer seclinter
```

### 3. 实现插件接口

```typescript
// src/index.ts
import {
  PluginInterface,
  PluginMeta,
  Sandbox,
  PluginHelpers,
  ScanResult
} from 'seclinter';

export const meta: PluginMeta = {
  name: 'seclinter-plugin-my-rule',
  version: '1.0.0',
  description: 'My custom security rule',
  target: 'custom',
  tags: ['security', 'custom'],
  permissions: ['fs:read']
};

class MyCustomPlugin implements PluginInterface {
  async init(sandbox: Sandbox, helpers?: PluginHelpers): Promise<void> {
    // 初始化代码
  }

  async scan(projectPath: string, options?: Record<string, any>): Promise<ScanResult[]> {
    // 扫描逻辑
    return [];
  }

  async cleanup?(): Promise<void> {
    // 清理资源
  }
}

export default new MyCustomPlugin();
```

### 4. 构建和发布

```bash
npm run build
npm publish
```

## 使用插件

### 在 Node.js 项目中

```javascript
const { createPluginManager } = require('seclinter');

async function main() {
  // 创建插件管理器
  const pluginManager = createPluginManager({
    autoDiscover: true
  });

  // 初始化
  await pluginManager.init();

  // 执行扫描
  const results = await pluginManager.scan({
    projectPath: process.cwd()
  });

  console.log(results);
}

main();
```

### 在 Webpack 中

```javascript
// webpack.config.js
const { SecLinterWebpackPlugin } = require('seclinter');

module.exports = {
  // ... 其他配置
  plugins: [
    new SecLinterWebpackPlugin({
      scanOnDone: true,
      failOnIssues: true,
      failSeverity: 'high'
    })
  ]
};
```

### 在 Vite 中

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { secLinterVitePlugin } from 'seclinter';

export default defineConfig({
  plugins: [
    secLinterVitePlugin({
      scanOnDevServer: true,
      writeReport: true
    })
  ]
});
```

## 错误处理与熔断机制

为确保插件的错误不会影响核心系统，SecLinter 实现了以下机制：

1. **Try-Catch 包装**：所有插件的方法调用都用 `try-catch` 包装
2. **熔断机制**：如果一个插件连续多次失败，会自动将其禁用并标记为不健康，防止持续报错影响扫描体验

## 许可证

MIT
