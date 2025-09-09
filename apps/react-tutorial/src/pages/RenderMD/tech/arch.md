# Markdown 渲染系统

这是一个模块化的 Markdown 渲染系统，提供了完整的 Markdown 解析、渲染和扩展功能。

## 系统架构

该系统由六个核心模块组成：

### 1. 核心解析模块

负责将 Markdown 文本解析为结构化的抽象语法树（AST）。

- **Tokenizer**: 词法分析器，将文本分解为标记序列
- **Parser**: 语法分析器，解析标记并构建初步的 AST 结构
- **ASTBuilder**: AST 构建器，完善和优化 AST 结构

### 2. 渲染处理模块

负责将 AST 渲染为 HTML 或 React 组件。

- **HtmlRenderer**: HTML 渲染器，将 AST 转换为 HTML 字符串
- **CustomRenderer**: 自定义渲染器，将 AST 转换为 React 组件
- **StyleMapper**: 样式映射器，管理节点样式和主题

### 3. 插件系统模块

提供可扩展的插件机制，支持自定义语法和渲染。

- **PluginManager**: 插件管理器，负责注册和执行插件
- **PluginTypes**: 插件类型定义，包括钩子和上下文
- **内置插件**: 表格、任务列表、目录、脚注等

### 4. 扩展功能模块

提供高级功能支持，如代码高亮、数学公式和图表渲染。

- **SyntaxHighlighter**: 代码高亮器，支持多种编程语言
- **MathRenderer**: 数学公式渲染器，支持 LaTeX 语法
- **DiagramRenderer**: 图表渲染器，支持 Mermaid 等图表语法

### 5. 主题与样式模块

管理主题和样式，支持动态切换主题。

- **ThemeManager**: 主题管理器，负责主题切换和应用
- **StyleGenerator**: 样式生成器，生成 CSS 变量和样式表
- **ThemeDefinitions**: 主题定义，包括颜色、字体等

### 6. 工具与工具模块

提供辅助工具和性能监控。

- **MarkdownUtils**: Markdown 工具类，提供常用工具函数
- **PerformanceMonitor**: 性能监控器，跟踪解析和渲染性能
- **StateManager**: 状态管理器，管理编辑器状态

## 使用方法

```tsx
import React from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import { ThemeName } from './modules/theme/ThemeDefinitions';

const App: React.FC = () => {
  return (
    <div className="app">
      <MarkdownEditor
        initialMarkdown="# Hello, Markdown!"
        theme={ThemeName.LIGHT}
        readOnly={false}
      />
    </div>
  );
};

export default App;
```

## 特性

- 完整的 Markdown 语法支持
- 模块化架构，易于扩展
- 插件系统，支持自定义语法和渲染
- 主题系统，支持浅色、深色和护眼主题
- 性能监控，跟踪解析和渲染性能
- 支持代码高亮、数学公式和图表渲染

## 扩展功能

- 表格支持
- 任务列表
- 目录生成
- 脚注
- 数学公式（LaTeX 语法）
- 图表（Mermaid 语法）
- 代码高亮（多种编程语言）

## 技术栈

- React
- TypeScript
- CSS/Less
- Immer (不可变状态管理)
