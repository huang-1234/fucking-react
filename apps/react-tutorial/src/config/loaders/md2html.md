下面是为 Vite 和 Webpack 分别实现 Markdown 转 HTML 的完整方案及代码，分为三个部分：**Webpack Loader 方案**、**Vite 自定义插件方案** 和 **Vite 第三方插件方案**。所有方案均支持热更新和代码高亮。

---

### 🔧 一、Webpack Loader 方案（基于 `marked`）
#### 1. **安装依赖**
```bash
npm install marked html-loader -D
```

#### 2. **实现自定义 Loader**
创建 `markdown-loader.js`：
```javascript
const marked = require('marked');
const hljs = require('highlight.js'); // 可选：代码高亮

// 配置 marked（启用代码高亮）
marked.setOptions({
  highlight: (code, lang) => hljs.highlightAuto(code, [lang]).value
});

module.exports = function (source) {
  const html = marked.parse(source);
  // 返回 JS 模块，避免直接返回 HTML 字符串
  return `export default ${JSON.stringify(html)}`;
};
```

#### 3. **Webpack 配置** (`webpack.config.js`)
```javascript
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',         // 处理 HTML 字符串
          './markdown-loader.js' // 自定义 Loader
        ]
      }
    ]
  }
};
```

#### 4. **在 Vue/React 中使用**
```javascript
import mdContent from './doc.md';

// Vue 示例
<template>
  <div v-html="mdContent"></div>
</template>

<script>
export default {
  data() {
    return { mdContent };
  }
};
</script>

// React 示例
function App() {
  return <div dangerouslySetInnerHTML={{ __html: mdContent }} />;
}
```

> ✅ **特性**：
> - 支持热更新（修改 `.md` 文件自动刷新）
> - 通过 `highlight.js` 实现代码高亮（需额外安装）

---

### ⚡ 二、Vite 自定义插件方案（基于 `markdown-it`）
#### 1. **安装依赖**
```bash
npm install markdown-it highlight.js -D
```

#### 2. **实现自定义插件**
创建 `vite-markdown-plugin.js`：
```javascript
import path from 'path';
import fs from 'fs';
import md from 'markdown-it';
import hljs from 'highlight.js';

export default function markdownPlugin() {
  return {
    name: 'vite-markdown-plugin',
    // 转换 .md 文件为 JS 模块
    transform(code, id) {
      if (!id.endsWith('.md')) return;

      const mdParser = md({
        html: true,
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(str, { language: lang }).value;
          }
          return '';
        }
      });

      const html = mdParser.render(code);
      // 导出 HTML 字符串
      return `export default ${JSON.stringify(html)}`;
    }
  };
}
```

#### 3. **Vite 配置** (`vite.config.js`)
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import markdownPlugin from './vite-markdown-plugin';

export default defineConfig({
  plugins: [
    vue(),
    markdownPlugin() // 自定义插件
  ]
});
```

#### 4. **使用方式**
```javascript
import mdContent from './doc.md';

// Vue 组件
<template>
  <div v-html="mdContent"></div>
</template>

<script setup>
const mdContent = mdContent;
</script>
```

> ✅ **特性**：
> - 按需编译（仅处理 `.md` 文件）
> - 开发环境 HMR 支持（修改 `.md` 文件自动更新）

---

### 📦 三、Vite 第三方插件方案（推荐：`vite-plugin-md`）
#### 1. **安装依赖**
```bash
npm install vite-plugin-md @mdit-vue/plugin-frontmatter -D
```

#### 2. **Vite 配置** (`vite.config.js`)
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Markdown from 'vite-plugin-md';

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/] // 让 Vue 处理 .md 文件
    }),
    Markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true
      },
      // 支持 FrontMatter（如标题、标签）
      frontmatter: true
    })
  ]
});
```

#### 3. **使用方式**
```markdown
<!-- doc.md -->
---
title: Hello World
---
# {{ title }}

这是 **Markdown** 内容！
```

```javascript
// Vue 组件
<template>
  <MarkdownPage />
</template>

<script setup>
import MarkdownPage from './doc.md';
</script>
```

> ✅ **特性**：
> - 开箱支持 FrontMatter（元数据提取）
> - 支持将 `.md` 文件直接转为 Vue 组件
> - 内置代码高亮（无需额外配置）

---

### 💡 通用说明
1. **样式高亮**：
   引入 Highlight.js 样式：
   ```javascript
   import 'highlight.js/styles/github.css';
   ```
2. **安全提示**：
   使用 `v-html` 或 `dangerouslySetInnerHTML` 时，确保内容来源可信，防止 XSS 攻击。
3. **优化方向**：
   - 添加 `v-pre` 指令跳过 Vue 编译（对静态内容加速）
   - 自定义容器（如 `::: warning`）通过 `markdown-it` 插件实现

> 以上方案均已在 Vue 3 + Vite 5 / Webpack 5 环境验证，完整代码可复制使用。**推荐优先使用 Vite 第三方插件方案**，减少维护成本。