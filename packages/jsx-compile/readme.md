# JSX编译器

将JSX语法编译为React.createElement调用的工具。

## 功能特点

- 支持将JSX语法转换为React.createElement调用
- 支持JSX Fragment（<>...</>）
- 支持JSX属性展开（{...props}）
- 支持命名空间组件（Namespace.Component）
- 区分HTML标签和React组件（基于首字母大小写）
- 提供命令行工具和API接口

## 安装

```bash
npm install jsx-compile
```

## 使用方法

### 命令行使用

```bash
# 编译单个JSX文件
jsx-compile input.jsx output.js

# 使用默认输出文件名（替换.jsx为.js）
jsx-compile input.jsx
```

### API使用

```javascript
const { parseJSX, parseJSXFile } = require('jsx-compile');

// 从字符串编译JSX
const jsxCode = '<div>Hello World</div>';
const jsCode = parseJSX(jsxCode);
console.log(jsCode);
// 输出: React.createElement("div", {}, "Hello World");

// 从文件编译JSX
const jsCode = parseJSXFile('component.jsx');
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
pnpm build
```

### 测试

```bash
# 运行所有测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage
```

## 测试覆盖内容

- `babelPlugin.js`: Babel插件，将JSX转换为React.createElement调用
- `jsxParser.js`: JSX解析器，提供API接口
- `cli.js`: 命令行工具

## 依赖

- `@babel/core`: Babel核心库
- `@babel/traverse`: Babel遍历工具
- `@babel/types`: Babel类型定义
- `@babel/plugin-syntax-jsx`: JSX语法支持（开发依赖）

## 许可证

ISC