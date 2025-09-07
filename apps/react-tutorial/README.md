# React 教程项目

这是一个全面的 React 学习与开发平台，集成了从 React 15 到 React 19 的各版本特性、算法可视化、打包工具探索以及现代前端开发技术栈。

## 项目概述

本项目旨在提供一个集教程、演示和实践于一体的 React 学习环境，涵盖：

- React 各版本（15-19）的核心特性与API演示
- 算法可视化与交互式学习
- 现代前端构建工具（Webpack、Vite）的使用对比
- 高级前端技术探索（SSR、性能优化、模块加载等）
- 丰富的可视化与交互组件库

## 技术栈

### 核心框架
- React 19.1.1
- TypeScript 5.8.3
- Vite 5.4.19
- React Router 7.2.0
- Ant Design 5.26.7

### 数据可视化
- ECharts 6.0.0
- Recharts 3.1.2
- D3.js 7.9.0
- Mermaid 11.10.1

### UI组件与交互
- Ant Design Icons 6.0.0
- Lucide React 0.542.0
- React-Rnd 10.5.2
- React-Window 1.8.11

### 代码与文档展示
- Monaco Editor 0.52.2
- React-Markdown 10.1.0
- React-Syntax-Highlighter 15.6.1
- MDX 3.1.0
- KaTeX 0.16.22

### 数据处理与状态管理
- Immer 10.1.1
- Lodash-es 4.17.21
- Dayjs 1.11.13
- Ahooks 3.9.4

### 测试与开发工具
- Vitest 2.1.5
- ESLint 9.30.1

## 项目结构

```
src/
├── ahooks/               # 自定义hooks实现
├── assets/               # 静态资源
├── components/           # 通用组件
├── config/               # 配置文件
├── context/              # React上下文
├── hooks/                # 自定义hooks
├── layouts/              # 布局组件
├── modules/              # 功能模块
├── pages/                # 页面组件
│   ├── Algorithm/        # 算法可视化
│   ├── ECMAScript/       # ES特性展示
│   ├── Performance/      # 性能优化
│   ├── React15/          # React 15特性
│   ├── React16/          # React 16特性
│   ├── React17/          # React 17特性
│   ├── React18/          # React 18特性
│   ├── React19/          # React 19特性
│   ├── SSR/              # 服务端渲染
│   ├── Vite/             # Vite构建工具
│   └── Webpack/          # Webpack构建工具
├── router/               # 路由配置
├── sandbox/              # 沙箱环境
├── services/             # 服务接口
├── styles/               # 全局样式
├── tech/                 # 技术文档
├── types/                # 类型定义
└── utils/                # 工具函数
```

## 功能模块

### React版本特性
- **React 15**: Fragments、PropTypes等经典特性
- **React 16**: Hooks、Error Boundaries等革命性更新
- **React 17**: 新JSX转换、事件委托机制改进
- **React 18**: Suspense SSR、useTransition等并发特性
- **React 19**: React Compiler、useFormState等最新特性

### 算法可视化
提供多种算法的交互式可视化学习体验：
- 动态规划 (DP)
- 堆 (Heap)
- 链表 (LinkTable)
- 图论 (Graph)
- 跳表 (SkipList)
- 队列 (Queue)
- 概率论 (ProbabilityTheory)
- 搜索算法 (Search)

### 前端工程化
- Webpack vs Vite构建对比
- 模块加载机制探索
- SSR实现与优化
- 性能监控与优化

### 交互式学习
- 代码编辑器集成
- Markdown/MDX渲染
- 富文本编辑
- Canvas交互

## 开发指南

### 环境要求
- Node.js: ^20.19.0 || >=22.12.0
- pnpm: 推荐使用

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 类型检查
```bash
pnpm ts
```

### 构建项目
```bash
pnpm build
# 或先进行类型检查再构建
pnpm ts:build
```

### 运行测试
```bash
pnpm test
# 运行覆盖率测试
pnpm coverage
```

### 代码检查
```bash
pnpm lint
```

## 可视化技术栈

本项目集成了丰富的前端可视化技术栈，用于构建各类数据可视化、图表展示和交互式界面：

### 图表与数据可视化
- **ECharts**: 功能强大的交互式图表库，支持多种图表类型和定制化选项
- **Recharts**: 基于React组件的可组合图表库，使用D3构建，提供声明式API
- **D3.js**: 强大的数据驱动文档操作库，用于创建复杂的自定义可视化

### 流程图与关系图
- **Mermaid**: 基于文本描述生成流程图、时序图、甘特图等图表
- **Lucide React**: 美观简洁的SVG图标集合，可用于图表标记和UI元素

### 布局与交互组件
- **React-Rnd**: 可调整大小和位置的拖拽组件，适用于构建仪表盘和自定义布局
- **React-Window**: 高效渲染大型列表和表格的虚拟化组件

### 代码与文档展示
- **React-Markdown**: 将Markdown渲染为React组件
- **React-Syntax-Highlighter**: 代码语法高亮组件
- **Monaco Editor**: VS Code使用的代码编辑器，支持智能提示和语法高亮
- **KaTeX**: 数学公式渲染库，支持在文档中展示复杂数学表达式

## 自定义Hooks

项目包含自定义DOM Hooks集合，提供了与可视化相关的功能：

- 元素尺寸监测 (`useElementSize`)
- 元素可见性检测 (`useElementVisibility`)
- 拖拽交互 (`useDrag`, `useDrop`)
- 鼠标位置跟踪 (`useMousePosition`)
- 滚动位置监测 (`useScrollPosition`)
- 全屏控制 (`useFullscreen`)

## 应用场景

这些技术栈组合可用于构建：

- 数据分析仪表盘
- 实时数据监控界面
- 交互式数据探索工具
- 算法可视化演示
- 流程图与关系图展示
- 大数据集的高效渲染与交互

## 贡献指南

欢迎对本项目进行贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件