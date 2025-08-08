# Fucking-React 项目文档

本项目包含两个主要部分：React学习平台和Vue学习平台，分别展示了React和Vue的核心特性、版本差异和最佳实践。

## 项目结构

```
fucking-react/
├── react-app/
│   └── vite-react-latest/  # React学习平台
└── vue-app/
    └── vite-vue-ts/        # Vue学习平台
```

## React学习平台 (vite-react-latest)

### 技术栈

- **框架**: React 18+
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: React Router
- **样式**: CSS-in-JS

### 核心功能

1. **多版本API展示**
   - React 15 特性展示 (PropTypes, Fragments)
   - React 16 特性展示 (Error Boundaries, Hooks)
   - React 17 特性展示 (Event Delegation, New JSX Transform)
   - React 18 特性展示 (Suspense SSR, useTransition)
   - React 19 特性展示 (React Compiler, useFormState)

2. **交互式代码示例**
   - 提供可运行的代码示例
   - 实时展示API使用效果

3. **版本对比**
   - 不同React版本API的差异对比
   - 升级迁移指南

4. **最佳实践展示**
   - 组件设计模式
   - 性能优化技巧

### 目录结构

```
vite-react-latest/
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

## Vue学习平台 (vite-vue-ts)

### 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: Vue Router
- **状态管理**: Pinia

### 核心功能

1. **Vue3核心特性展示**
   - Composition API
   - 响应式系统
   - 生命周期钩子
   - 性能优化

2. **交互式代码编辑器**
   - 在线编辑和运行Vue代码
   - 实时预览和控制台输出

3. **Vue2与Vue3 API对比**
   - Options API vs Composition API
   - 响应式系统对比
   - 生命周期对比
   - 逻辑复用方式对比

4. **最佳实践指南**
   - 组件设计模式
   - 性能优化技巧
   - TypeScript集成

### 目录结构

```
vite-vue-ts/
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

## 安装与运行

### React学习平台

```bash
cd react-app/vite-react-latest
npm install
npm run dev
```

### Vue学习平台

```bash
cd vue-app/vite-vue-ts
npm install vue-router@4 pinia@2
npm run dev
```

## 学习路径建议

1. **React初学者**:
   - 从React16的Hooks开始学习
   - 理解函数式组件和类组件的区别
   - 掌握核心Hook (useState, useEffect, useContext)

2. **Vue初学者**:
   - 从Composition API开始
   - 理解响应式系统的工作原理
   - 学习组件通信和生命周期

3. **进阶学习**:
   - React: 深入了解Concurrent Mode和Suspense
   - Vue: 探索自定义组合函数和性能优化

## 贡献指南

欢迎提交Pull Request或Issue来完善本项目，特别是:

1. 添加新的React/Vue版本特性展示
2. 改进代码示例和文档
3. 修复bug和改进用户体验

## 许可证

MIT
