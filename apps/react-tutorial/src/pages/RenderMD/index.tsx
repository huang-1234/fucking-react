import React, { useState } from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import { ThemeName } from './modules/theme/ThemeDefinitions';
import './index.less';

const SAMPLE_MARKDOWN = `# Markdown 渲染器演示

这是一个完整的 Markdown 渲染系统演示。

## 基本语法

### 文本格式化

*斜体文本* 和 **粗体文本**

~~删除线~~ 和 \`行内代码\`

### 列表

无序列表:
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

有序列表:
1. 第一项
2. 第二项
3. 第三项

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务

## 扩展功能

### 代码块与语法高亮

\`\`\`javascript
// 这是一段 JavaScript 代码
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));
\`\`\`

### 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |

### 数学公式

行内公式: $E = mc^2$

块级公式:

$$
\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)
$$

### 图表 (Mermaid)

\`\`\`mermaid
graph TD
  A[开始] --> B{是否已登录?}
  B -->|是| C[显示主页]
  B -->|否| D[显示登录页]
  C --> E[结束]
  D --> E
\`\`\`

### 脚注

这里有一个脚注[^1]和另一个脚注[^2]。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注的内容。

## 目录

[TOC]

## 引用块

> 这是一个引用块
>
> 可以包含多个段落

## 水平分割线

---

## 链接和图片

[React 官网](https://reactjs.org)

![React Logo](https://reactjs.org/logo-og.png)
`;

const RenderMDPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeName>(ThemeName.LIGHT);

  return (
    <div className="render-md-page">
      <div className="page-header">
        <h1>Markdown 渲染系统</h1>
        <p>基于模块化架构的完整 Markdown 渲染系统</p>
      </div>

      <div className="editor-wrapper">
        <MarkdownEditor
          initialMarkdown={SAMPLE_MARKDOWN}
          theme={theme}
        />
      </div>

      <div className="module-info">
        <h2>系统核心模块</h2>
        <div className="module-grid">
          <div className="module-card">
            <h3>核心解析模块</h3>
            <p>将 Markdown 文本解析为结构化的 AST</p>
            <ul>
              <li>Tokenizer: 词法分析</li>
              <li>Parser: 语法分析</li>
              <li>ASTBuilder: 构建抽象语法树</li>
            </ul>
          </div>

          <div className="module-card">
            <h3>渲染处理模块</h3>
            <p>将 AST 渲染为 HTML 或 React 组件</p>
            <ul>
              <li>HtmlRenderer: HTML 渲染器</li>
              <li>CustomRenderer: 自定义组件渲染器</li>
              <li>StyleMapper: 样式映射器</li>
            </ul>
          </div>

          <div className="module-card">
            <h3>插件系统模块</h3>
            <p>提供可扩展的插件机制</p>
            <ul>
              <li>PluginManager: 插件管理器</li>
              <li>PluginTypes: 插件类型定义</li>
              <li>内置插件: 表格、任务列表等</li>
            </ul>
          </div>

          <div className="module-card">
            <h3>扩展功能模块</h3>
            <p>提供高级功能支持</p>
            <ul>
              <li>SyntaxHighlighter: 代码高亮</li>
              <li>MathRenderer: 数学公式</li>
              <li>DiagramRenderer: 图表渲染</li>
            </ul>
          </div>

          <div className="module-card">
            <h3>主题与样式模块</h3>
            <p>管理主题和样式</p>
            <ul>
              <li>ThemeManager: 主题管理器</li>
              <li>StyleGenerator: 样式生成器</li>
              <li>内置主题: 浅色、深色、护眼</li>
            </ul>
          </div>

          <div className="module-card">
            <h3>工具与工具模块</h3>
            <p>提供辅助工具和性能监控</p>
            <ul>
              <li>MarkdownUtils: Markdown 工具类</li>
              <li>PerformanceMonitor: 性能监控</li>
              <li>StateManager: 状态管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderMDPage;