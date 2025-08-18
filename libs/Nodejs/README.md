# React Props to Formily Schema

这个项目演示了如何将 React 组件的 Props 自动转换为 Formily Schema。

## 功能特点

- 自动提取 React 组件的 Props 定义
- 将 Props 转换为 JSON Schema 和 Formily Schema
- 支持 Vite 和 Webpack 两种构建工具
- 提供虚拟模块访问生成的 Schema

## 安装依赖

```bash
pnpm install
```

## 开发

### 使用 Vite 开发

```bash
pnpm run dev
```

### 使用 Webpack 开发

```bash
pnpm run dev:webpack
```

## 构建

### 使用 Vite 构建

```bash
pnpm run build
```

### 使用 Webpack 构建

```bash
pnpm run build:webpack
```

## 插件使用说明

### Vite 插件

在 `vite.config.ts` 中配置：

```typescript
import VitePropsToFormilyPlugin from './plugins/props-to-schema/vite-plugin-props-to-formily';

export default defineConfig({
  plugins: [
    // ...其他插件
    VitePropsToFormilyPlugin(),
  ],
});
```

### Webpack 插件

在 `webpack.config.js` 中配置：

```javascript
const { WebpackPropsToFormily } = require('./plugins/props-to-schema/webpack-plugin-props-to-formily');

module.exports = {
  // ...其他配置
  plugins: [
    // ...其他插件
    new WebpackPropsToFormily(),
  ],
};
```

> 注意：为了避免ESM和CommonJS混用导致的问题，我们使用了CommonJS格式的webpack配置。

## 在组件中使用

### Vite 项目

```typescript
import formilySchemas from 'virtual:formily-props';

// 使用生成的 Schema
console.log(formilySchemas);
```

### Webpack 项目

```typescript
// 从生成的 JSON 文件中导入
import formilySchemas from './formily-props.json';

// 使用生成的 Schema
console.log(formilySchemas);
```

## 技术栈

- React
- TypeScript
- Vite / Webpack
- react-docgen-typescript
- @formily/json-schema

## 常见问题

### 模块导入错误

在混合使用 ESM 和 CommonJS 模块时可能会遇到以下错误：

1. 使用 ESM 时出现 `require is not defined`
2. 使用 CommonJS 时出现 `Cannot use import statement outside a module`
3. 导入 TypeScript 文件时出现 `Unknown file extension ".ts"`

**解决方案**：

1. 对于 Vite 配置，保持 ESM 格式
2. 对于 Webpack 配置，使用 CommonJS 格式
3. 简化插件实现，避免跨模块系统的复杂依赖