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

export {
  mermaidExample,
  mathExample,
  tableExample,
  codeExample,
  combinedExample

}