# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


# 前端可视化技术栈

本项目集成了丰富的前端可视化技术栈，用于构建各类数据可视化、图表展示和交互式界面。

## 图表与数据可视化

### 通用图表库
- [ECharts](https://echarts.apache.org/) - 功能强大的交互式图表库，支持多种图表类型和定制化选项
- [Recharts](https://recharts.org/) - 基于React组件的可组合图表库，使用D3构建，提供声明式API
- [D3.js](https://d3js.org/) - 强大的数据驱动文档操作库，用于创建复杂的自定义可视化

### 流程图与关系图
- [Mermaid](https://mermaid.js.org/) - 基于文本描述生成流程图、时序图、甘特图等图表
- [Lucide React](https://lucide.dev/) - 美观简洁的SVG图标集合，可用于图表标记和UI元素

## 布局与交互组件

### 布局组件
- [React-Rnd](https://github.com/bokuweb/react-rnd) - 可调整大小和位置的拖拽组件，适用于构建仪表盘和自定义布局
- [React-Window](https://github.com/bvaughn/react-window) - 高效渲染大型列表和表格的虚拟化组件

### 代码与文档展示
- [React-Markdown](https://github.com/remarkjs/react-markdown) - 将Markdown渲染为React组件
- [React-Syntax-Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - 代码语法高亮组件
- [Monaco Editor](https://github.com/microsoft/monaco-editor) - VS Code使用的代码编辑器，支持智能提示和语法高亮
- [Katex](https://katex.org/) - 数学公式渲染库，支持在文档中展示复杂数学表达式

## 数据处理与状态管理

- [Immer](https://immerjs.github.io/immer/) - 不可变数据结构处理库，简化状态更新逻辑
- [Lodash-es](https://lodash.com/) - 提供实用工具函数，用于数据转换和处理
- [Dayjs](https://day.js.org/) - 轻量级日期处理库，用于时间序列数据格式化

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
