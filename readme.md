# React 项目 (`@vite-react-latest/`)

## 技术栈
- **框架**: React 19
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: Ant Design
- **路由**: React Router
- **状态管理**: React Hooks
- **代码高亮**: React Syntax Highlighter
- **Markdown 支持**: React Markdown

## 项目结构
```
fucking-react/
├── apps/
│   ├── react-tutorial/  # React学习平台
│   └── vue-tutorial/    # Vue学习平台
```

## React学习平台 (react-tutorial)

### 技术栈
- **框架**: React 19
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: Ant Design
- **路由**: React Router
- **状态管理**: React Hooks

### 目录结构
```
react-tutorial/
├── src/
│   ├── components/         # 通用组件
│   ├── hooks/              # 自定义Hooks
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── React15/        # React 15特性
│   │   ├── React16/        # React 16特性
│   │   ├── React17/        # React 17特性
│   │   ├── React18/        # React 18特性
│   │   └── React19/        # React 19特性
│   ├── router/             # 路由配置
│   ├── sandbox/            # 沙盒环境
│   └── styles/             # 全局样式
```

## Vue学习平台 (vue-tutorial)

### 技术栈
- **框架**: Vue 3
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: Ant Design Vue
- **路由**: Vue Router
- **状态管理**: Pinia

### 目录结构
```
vue-tutorial/
├── src/
│   ├── components/         # 通用组件
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia状态管理
│   ├── views/              # 页面视图
│   │   ├── vue3/           # Vue3特性页面
│   │   └── APICompare.vue  # API对比页面
│   └── assets/             # 静态资源
```

## 核心功能
1. **多版本支持**: 提供 React 15 到 19 的 API 示例和特性对比。
2. **沙盒环境**: 使用 `<iframe>` 隔离不同版本的 React 代码。
3. **代码高亮**: 支持语法高亮和 Markdown 渲染。
4. **响应式设计**: 适配移动端和桌面端。

---

# Monorepo 包介绍

## @libs

### 概述
`@libs` 是一个包含多个独立库的 monorepo 包，主要用于提供 ECMAScript、Node.js 和算法相关的工具和示例代码。

### 子包
1. **ECMAScript**
   - 提供 ECMAScript 特性的示例和工具函数。
   - 包括 Promise 链式调用、任务调度等。

2. **Nodejs**
   - 包含 Node.js 核心特性的示例代码，如事件循环、定时器等。
   - 提供测试用例和性能分析工具。

3. **fucking-algorithm**
   - 算法学习和实践的工具包。
   - 包括数据结构、图算法、树算法等。

### 使用场景
- 学习 ECMAScript 和 Node.js 的核心特性。
- 快速查找和复用算法实现。

---

## @apps

### 概述
`@apps` 是一个包含 React 和 Vue 学习平台的 monorepo 包，用于展示不同框架的特性和最佳实践。

### 子包
1. **react-tutorial**
   - 提供 React 15 到 19 的 API 示例和特性对比。
   - 包含沙盒环境和交互式代码示例。

2. **vue-tutorial**
   - 展示 Vue 3 的核心特性，如 Composition API 和响应式系统。
   - 提供代码编辑器和实时预览功能。

### 使用场景
- 学习 React 和 Vue 的核心特性。
- 快速查找和复用框架的最佳实践。

---

## @servers

### 概述
`@servers` 是一个包含服务器端渲染 (SSR) 和开发工具的 monorepo 包。

### 子包
1. **ssr**
   - 提供基于 React 的 SSR 实现。
   - 包含集群配置、中间件和测试工具。

### 使用场景
- 快速搭建 SSR 应用。
- 学习和测试 SSR 相关技术。

---

## 安装与运行

### @libs
```bash
cd libs/ECMAScript/PromiseTask
npm install
npm run test
```

### @apps
```bash
cd apps/react-tutorial
npm install
npm run dev
```

### @servers
```bash
cd servers/ssr
npm install
npm run dev
```

## 贡献指南
欢迎提交 Pull Request 或 Issue 来完善本项目，特别是：
1. 添加新的特性示例。
2. 改进文档和代码示例。
3. 修复 bug 和改进性能。

## 许可证
MIT
