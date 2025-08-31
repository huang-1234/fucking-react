# Fucking React - React 深度学习与实现项目

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646cff.svg)](https://vitejs.dev/)

## 🎯 项目概述

这是一个深度学习和实现React生态系统的综合性项目，包含了从React核心原理到实际应用的完整技术栈。项目采用Monorepo架构，使用pnpm workspace管理多个子包，涵盖了React Hooks实现、Reconciler协调器、JSX编译器、SSR服务器、算法库等多个核心模块。

## 🏗️ 项目架构

```
fucking-react/
├── packages/           # 核心包
│   ├── hooks/         # React Hooks链表实现
│   ├── jsx-compile/   # JSX语法编译器
│   ├── Reconciler/    # React协调器实现
│   └── shared/        # 共享类型和工具
├── apps/              # 应用程序
│   ├── react-tutorial/ # React教学应用
│   └── vue-tutorial/   # Vue教学应用
├── servers/           # 服务端应用
│   └── ssr/          # React SSR服务器
├── libs/              # 工具库
│   ├── algorithm/     # 算法实现库
│   ├── ECMAScript/    # ES特性实现
│   └── Nodejs/        # Node.js相关工具
└── docs/              # 文档
```

## 🔧 核心技术栈

- **前端框架**: React 19.1.1, Vue 3
- **开发语言**: TypeScript 5.8.3
- **构建工具**: Vite 6.0.0
- **包管理**: pnpm 10.13.1 (Workspace)
- **服务端**: Koa 2 + React SSR
- **测试框架**: Vitest 2.1.5
- **代码规范**: ESLint + Prettier

## 📦 核心包详解

### 🪝 packages/hooks - React Hooks实现

基于React Fiber架构的完整Hooks系统实现，包含：

- **链表结构的Hooks存储系统**
- **支持所有常用Hooks**: useState, useReducer, useEffect, useMemo, useCallback, useRef
- **批量更新处理机制**
- **Hooks调试和可视化工具**
- **完整的Fiber节点支持**

```javascript
// 使用示例
const { useState, useEffect, renderWithHooks } = require('hooks');

function Counter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  return { count, setCount };
}
```

### ⚙️ packages/Reconciler - React协调器

实现了React的核心协调算法，包含：

- **基于Fiber架构的协调器**
- **深度优先遍历的工作循环**
- **支持函数组件、宿主组件和文本节点**
- **更新队列和批量更新机制**
- **beginWork和completeWork流程**

### 🔄 packages/jsx-compile - JSX编译器

JSX语法编译工具，支持：

- **Babel插件实现**
- **AST解析和转换**
- **CLI工具支持**
- **自定义JSX转换规则**

### 🌐 servers/ssr - 高性能SSR服务

基于React 19 + Koa的服务端渲染解决方案：

- **流式渲染**: 利用React 19的流式SSR功能
- **多级缓存**: 页面级、组件级、数据级缓存
- **集群模式**: Node.js集群处理高并发
- **性能监控**: 请求响应时间、内存使用、缓存命中率监控

## 🧮 算法与工具库

### libs/algorithm - 算法实现库

包含丰富的算法实现和可视化：

- **图算法**: BFS、DFS、拓扑排序
- **动态规划**: 最长递增子序列、背包问题
- **树结构**: 二叉树、线段树、并查集
- **数组操作**: 差分数组、区间问题
- **算法可视化**: React组件实现

### libs/ECMAScript - ES特性实现

深度实现ECMAScript核心特性：

- **异步编程**: Promise、async/await实现
- **任务调度**: 多种调度器实现
- **事件循环**: Node.js事件循环机制
- **内存管理**: V8隐藏类优化

## 🎓 教学应用

### apps/react-tutorial - React教学平台

交互式React学习平台，包含：

- **多版本React支持**: React 15-19特性对比
- **代码实时预览**: Monaco Editor + 热更新
- **组件库展示**: 自定义组件和第三方库集成
- **MDX文档支持**: 文档即代码的学习体验

### apps/vue-tutorial - Vue教学平台

Vue 3学习平台，提供：

- **Vue 3 Composition API教学**
- **响应式系统原理**
- **组件通信模式**
- **状态管理最佳实践**

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/fucking-react.git
cd fucking-react

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动React教学应用
cd apps/react-tutorial
pnpm dev

# 启动SSR服务器
cd servers/ssr
pnpm dev

# 运行算法可视化
cd libs/algorithm
pnpm dev
```

### 构建生产版本

```bash
# 构建所有包
pnpm build

# 构建特定包
cd packages/hooks
pnpm build
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包测试
cd packages/hooks
pnpm test

# 运行算法测试
cd libs/algorithm
pnpm test
```

## 📚 学习路径

1. **React基础**: 从`apps/react-tutorial`开始，了解React各版本特性
2. **Hooks原理**: 深入`packages/hooks`，理解Hooks链表实现
3. **协调器机制**: 学习`packages/Reconciler`，掌握Fiber架构
4. **SSR实践**: 体验`servers/ssr`，了解服务端渲染
5. **算法提升**: 通过`libs/algorithm`，提升算法思维
6. **工程实践**: 学习项目架构和工程化配置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

- React团队提供的优秀框架和文档
- 开源社区的无私贡献
- 所有参与项目开发的贡献者

---

**注**: 这是一个学习型项目，旨在深度理解React生态系统的工作原理。代码实现可能与生产环境的React有所差异，仅供学习参考。
