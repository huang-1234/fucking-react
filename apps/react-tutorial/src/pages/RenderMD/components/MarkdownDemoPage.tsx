import React, { useState } from 'react';
import { Tabs, Card, Space, Typography, Switch, Select } from 'antd';
import { ThemeName } from '../modules/theme/ThemeDefinitions';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownEditor from './MarkdownEditor';
import CodeBlock from './CodeBlock';
import MermaidDiagram from './MermaidDiagram';
import TableOfContents from './TableOfContents';
import ControlPanel from './ControlPanel';
import PerformancePanel from './PerformancePanel';
import type { MarkdownConfig } from '../types/markdown';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;
const { Option } = Select;

// Markdown示例内容
const mermaidExample = `
# Mermaid图表示例

\`\`\`mermaid
flowchart LR
    A[开始] --> B{条件判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库

    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 显示结果
\`\`\`

## 类图

\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +makeSound() void
    }
    class Dog {
        +bark() void
    }
    class Cat {
        +meow() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
\`\`\`
`;

const mathExample = `
# 数学公式示例

## 行内公式

爱因斯坦质能方程: $E=mc^2$

## 块级公式

$$
\\frac{\\partial u}{\\partial t} = h^2 \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right)
$$

## 矩阵

$$
\\begin{pmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{pmatrix}
$$

## 多行公式

$$
\\begin{align}
\\dot{x} & = \\sigma(y-x) \\\\
\\dot{y} & = \\rho x - y - xz \\\\
\\dot{z} & = -\\beta z + xy
\\end{align}
$$
`;

const tableExample = `
# 表格示例

## 基本表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |

## 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |

## 复杂表格

| 功能 | 描述 | 支持情况 | 备注 |
|------|------|---------|------|
| **Mermaid** | 图表渲染 | ✅ | 支持流程图、时序图等 |
| **数学公式** | LaTeX语法 | ✅ | 支持行内和块级公式 |
| **代码高亮** | 多语言支持 | ✅ | 支持30+种编程语言 |
| **表格** | 格式化表格 | ✅ | 支持对齐和合并单元格 |
`;

const codeExample = `
# 代码块示例

## JavaScript

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 输出斐波那契数列的前10个数
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}
\`\`\`

## Python

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 输出斐波那契数列的前10个数
for i in range(10):
    print(fibonacci(i))
\`\`\`

## Java

\`\`\`java
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        // 输出斐波那契数列的前10个数
        for (int i = 0; i < 10; i++) {
            System.out.println(fibonacci(i));
        }
    }
}
\`\`\`

## Go

\`\`\`go
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    // 输出斐波那契数列的前10个数
    for i := 0; i < 10; i++ {
        fmt.Println(fibonacci(i))
    }
}
\`\`\`

## Rust

\`\`\`rust
fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}

fn main() {
    // 输出斐波那契数列的前10个数
    for i in 0..10 {
        println!("{}", fibonacci(i));
    }
}
\`\`\`
`;

const combinedExample = `
# Markdown渲染系统功能展示

## 目录

- [Markdown渲染系统功能展示](#markdown渲染系统功能展示)
  - [目录](#目录)
  - [基本格式](#基本格式)
  - [代码块](#代码块)
  - [表格](#表格)
  - [Mermaid图表](#mermaid图表)
  - [数学公式](#数学公式)

## 基本格式

**粗体文本** *斜体文本* ~~删除线~~ [链接文本](https://example.com)

> 引用块
>
> 多行引用

- 无序列表项1
- 无序列表项2
  - 嵌套列表项

1. 有序列表项1
2. 有序列表项2
   1. 嵌套有序列表

任务列表:
- [x] 已完成任务
- [ ] 未完成任务

## 代码块

行内代码: \`const x = 10;\`

\`\`\`javascript
// JavaScript代码示例
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));
\`\`\`

\`\`\`python
# Python代码示例
def greeting(name):
    return f"Hello, {name}!"

print(greeting("World"))
\`\`\`

## 表格

| 功能 | 描述 | 支持情况 |
|------|------|---------|
| **Mermaid** | 图表渲染 | ✅ |
| **数学公式** | LaTeX语法 | ✅ |
| **代码高亮** | 多语言支持 | ✅ |
| **表格** | 格式化表格 | ✅ |

## Mermaid图表

\`\`\`mermaid
flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    C --> E[结束]
    D --> E
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 点击登录
    前端->>后端: 发送登录请求
    后端->>数据库: 验证用户信息
    数据库-->>后端: 返回验证结果
    后端-->>前端: 返回登录结果
    前端-->>用户: 显示登录状态
\`\`\`

## 数学公式

行内公式: $E=mc^2$

块级公式:

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

矩阵:

$$
\\begin{bmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{bmatrix}
$$
`;

const MarkdownDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('combined');
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(ThemeName.LIGHT);
  // 当前内容示例
  const [config, setConfig] = useState<MarkdownConfig>({
    theme: 'light',
    enableCache: true,
    enableVirtualScroll: false,
    enableToc: true,
    enableMath: true,
    enableGfm: true,
    enableSanitize: true,
    linkTarget: '_blank'
  });

  // 获取当前示例内容
  const getExampleContent = () => {
    switch (activeTab) {
      case 'mermaid': return mermaidExample;
      case 'math': return mathExample;
      case 'table': return tableExample;
      case 'code': return codeExample;
      case 'combined': return combinedExample;
      default: return combinedExample;
    }
  };

  // 提取标题生成目录
  const extractHeadings = (content: string) => {
    const regex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      headings.push({ id, text, level });
    }

    return headings;
  };

  const headings = extractHeadings(getExampleContent());

  // 处理主题变更
  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    setConfig(prev => ({ ...prev, theme }));

    // 更新文档主题
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* 左侧目录 - 现在作为固定侧边栏 */}
      {config.enableToc && (
        <TableOfContents
          headings={headings}
          defaultExpanded={false}
        />
      )}

      {/* 右侧控制面板 - 保持原样 */}
      <ControlPanel
        config={config}
        onChange={setConfig}
        defaultExpanded={false}
      />

      {/* 主内容区 */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '100%',
        padding: '10px', marginRight: '40px', height: '100%',
        overflow: 'auto'
      }}>
        <Title level={2}>Markdown渲染扩展功能演示</Title>
        <Paragraph>
          这个页面展示了Markdown渲染系统的各种扩展功能，包括Mermaid图表、数学公式、表格和代码高亮等。
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="功能设置">
            <Space>
              <span>主题:</span>
              <Select
                value={currentTheme}
                onChange={handleThemeChange}
                style={{ width: 120 }}
              >
                <Option value={ThemeName.LIGHT}>浅色</Option>
                <Option value={ThemeName.DARK}>深色</Option>
                <Option value={ThemeName.SEPIA}>护眼</Option>
              </Select>

              <span>启用目录:</span>
              <Switch
                checked={config.enableToc}
                onChange={checked => setConfig(prev => ({ ...prev, enableToc: checked }))}
              />

              <span>启用数学公式:</span>
              <Switch
                checked={config.enableMath}
                onChange={checked => setConfig(prev => ({ ...prev, enableMath: checked }))}
              />

              <span>启用GFM:</span>
              <Switch
                checked={config.enableGfm}
                onChange={checked => setConfig(prev => ({ ...prev, enableGfm: checked }))}
              />
            </Space>
          </Card>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="综合示例" key="combined" />
            <TabPane tab="Mermaid图表" key="mermaid" />
            <TabPane tab="数学公式" key="math" />
            <TabPane tab="表格" key="table" />
            <TabPane tab="代码块" key="code" />
          </Tabs>

          <Card title="Markdown编辑器" style={{ marginBottom: '20px' }}>
            <MarkdownEditor
              initialMarkdown={getExampleContent()}
              theme={currentTheme}
              readOnly={false}
            />
          </Card>

          <Card title="渲染结果">
            <MarkdownRenderer
              content={getExampleContent()}
              allowHtml={!config.enableSanitize}
              linkTarget={config.linkTarget}
              className="markdown-body"
            />
          </Card>

          <Card title="性能监控">
            <PerformancePanel />
          </Card>

          <Card title="独立组件展示">
            <Title level={4}>代码块组件</Title>
            <CodeBlock
              inline={false}
              className="language-javascript"
              theme={currentTheme === ThemeName.DARK ? 'dark' : 'light'}
            >
              {`function example() {\n  console.log("这是一个代码块组件示例");\n  return "Hello World";\n}`}
            </CodeBlock>

            <Title level={4} style={{ marginTop: '20px' }}>Mermaid图表组件</Title>
            <MermaidDiagram
              chart={`graph TD\n  A[开始] --> B{判断}\n  B -->|是| C[处理]\n  B -->|否| D[结束]\n  C --> D`}
              theme={currentTheme === ThemeName.DARK ? 'dark' : 'default'}
              initialView="both"
            />
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default MarkdownDemoPage;