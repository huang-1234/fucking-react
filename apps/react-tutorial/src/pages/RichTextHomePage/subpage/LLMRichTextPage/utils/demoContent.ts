import { type ContentChunk } from '../types';

/**
 * 演示用Markdown内容
 */
export const demoMarkdown = `# LLM富文本渲染演示

这是一个展示大语言模型流式渲染效果的演示页面。支持Markdown语法、代码高亮、数学公式和Mermaid图表等功能。

## Markdown基础语法

### 列表

无序列表:

- 项目一
- 项目二
- 项目三

有序列表:

1. 第一步
2. 第二步
3. 第三步

### 强调

*斜体文本* 和 **粗体文本**

### 引用

> 这是一段引用文本。
>
> 引用可以包含多个段落。

## 代码高亮

\`\`\`javascript
// 这是一段JavaScript代码
function hello(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}!\`;
}

hello('World');
\`\`\`

\`\`\`python
# 这是一段Python代码
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fibonacci(10))
\`\`\`

## 数学公式

行内公式: $E = mc^2$

块级公式:

$$
\\frac{\\partial f}{\\partial x} = 2x
$$

$$
\\begin{aligned}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\
\\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} & = 0
\\end{aligned}
$$

## 表格

| 功能 | 描述 | 支持情况 |
| --- | --- | --- |
| Markdown | 基础Markdown语法 | ✅ |
| 代码高亮 | 支持多种语言 | ✅ |
| 数学公式 | KaTeX渲染 | ✅ |
| Mermaid | 流程图等 | ✅ |
| 流式渲染 | 打字机效果 | ✅ |

## Mermaid图表

\`\`\`mermaid
graph TD
  A[开始] --> B{是否有缓存?}
  B -->|是| C[使用缓存]
  B -->|否| D[从API获取]
  C --> E[渲染内容]
  D --> E
  E --> F[结束]
\`\`\`

\`\`\`mermaid
sequenceDiagram
  participant 用户
  participant 客户端
  participant 服务器

  用户->>客户端: 输入提示词
  客户端->>服务器: 发送API请求
  服务器->>服务器: 生成内容
  服务器-->>客户端: 流式返回内容
  客户端-->>用户: 流式渲染内容
\`\`\`

## 图片

![React Logo](https://reactjs.org/logo-og.png)

## 结语

这个演示展示了LLM富文本渲染的各种功能，包括流式渲染效果。可以通过控制面板调整渲染速度和其他参数。`;

/**
 * 演示用分块内容
 */
export const demoChunks: ContentChunk[] = [
  {
    id: 'chunk-1',
    type: 'text',
    content: '# LLM分块渲染演示\n\n这是一个展示大语言模型**分块渲染**效果的演示页面。每个内容块会单独渲染，支持不同类型的内容。'
  },
  {
    id: 'chunk-2',
    type: 'text',
    content: '## 文本块\n\n这是一个普通的文本块，支持Markdown语法。\n\n- 列表项1\n- 列表项2\n- 列表项3'
  },
  {
    id: 'chunk-3',
    type: 'code',
    content: '// 这是一个JavaScript代码块\nfunction greeting(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greeting("World"));',
    metadata: {
      language: 'javascript'
    }
  },
  {
    id: 'chunk-4',
    type: 'text',
    content: '## 数学公式\n\n下面是一个数学公式块:'
  },
  {
    id: 'chunk-5',
    type: 'math',
    content: '$$\n\\begin{aligned}\n\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\\n\\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\\n\\end{aligned}\n$$'
  },
  {
    id: 'chunk-6',
    type: 'text',
    content: '## Mermaid图表\n\n下面是一个Mermaid流程图:'
  },
  {
    id: 'chunk-7',
    type: 'mermaid',
    content: 'graph TD\n  A[开始] --> B{判断条件}\n  B -->|条件1| C[处理1]\n  B -->|条件2| D[处理2]\n  C --> E[结束]\n  D --> E'
  },
  {
    id: 'chunk-8',
    type: 'text',
    content: '## 表格\n\n| 名称 | 类型 | 描述 |\n| --- | --- | --- |\n| 文本 | text | 普通文本内容 |\n| 代码 | code | 代码高亮显示 |\n| 数学公式 | math | KaTeX渲染 |\n| 图表 | mermaid | Mermaid图表 |'
  },
  {
    id: 'chunk-9',
    type: 'text',
    content: '## 结语\n\n分块渲染可以提供更好的用户体验，特别是在处理大型响应时。每个块可以独立渲染，不需要等待整个内容加载完成。'
  }
];
