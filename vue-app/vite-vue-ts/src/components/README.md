# Vue3学习平台代码编辑器组件

本目录包含了基于CodeMirror 6的代码编辑器组件，用于Vue3学习平台的代码展示和编辑功能。

## 组件列表

### 1. SimpleCodeEditor.vue

一个简单的代码编辑器组件，使用textarea实现，支持基本的代码编辑和展示功能。

**特性：**
- 支持代码编辑和只读模式
- 支持多种编程语言的基本语法高亮
- 适配明暗主题
- 自定义滚动条样式
- 运行代码按钮

**用法：**
```vue
<SimpleCodeEditor
  v-model:code="codeValue"
  language="vue"
  height="300px"
  :readOnly="false"
  @run="runCode"
/>
```

### 2. SimpleCodeComparison.vue

用于展示代码比较的组件，特别适合在API对比页面中使用。

**特性：**
- 左右分栏对比代码
- 支持代码复制功能
- 可折叠代码显示
- 适配明暗主题
- 响应式设计，在移动设备上自动调整为上下布局

**用法：**
```vue
<SimpleCodeComparison
  title="组件基本结构"
  :leftCode="vue2Code"
  :rightCode="vue3Code"
  leftLabel="Options API (Vue2)"
  rightLabel="Composition API (Vue3)"
  height="400px"
/>
```

### 3. VueExampleBlock.vue

用于展示Vue代码示例的组件，支持代码和输出结果展示。

**特性：**
- 代码展示与可选的输出结果
- 代码复制功能
- 可折叠代码和输出
- 适配明暗主题

**用法：**
```vue
<VueExampleBlock
  title="响应式数据示例"
  description="使用ref和reactive创建响应式数据"
  :code="exampleCode"
  :showOutput="true"
>
  <template #output>
    <div class="example-result">
      <!-- 输出结果内容 -->
    </div>
  </template>
</VueExampleBlock>
```

## 高级编辑器组件

> 注意：以下组件需要安装相关依赖才能使用，目前项目中使用的是简化版组件。

### 1. CodeEditor.vue

基于CodeMirror 6的代码编辑器组件，支持语法高亮和主题切换。

### 2. AdvancedCodeEditor.vue

扩展的CodeMirror 6编辑器，支持语言切换、自动补全和代码格式化。

### 3. VueCodeEditor.vue

专门为Vue代码设计的编辑器，提供Vue特定的语法高亮和自动补全。

## 依赖说明

要使用高级编辑器组件，需要安装以下依赖：

```bash
pnpm install vue-codemirror6@1.3.22 @codemirror/lang-javascript@6.2.4 @codemirror/theme-one-dark@6.1.3
```

## 使用建议

1. 对于简单的代码展示，使用`SimpleCodeEditor`和`SimpleCodeComparison`组件
2. 对于需要交互式编辑的场景，如Playground页面，可以在安装依赖后使用高级编辑器组件
3. 所有组件都支持明暗主题切换，会自动跟随应用的主题设置

## 自定义主题

组件的样式使用了CSS变量，可以通过修改这些变量来自定义主题：

```css
:root {
  --primary-color: #42b883;
  --primary-color-hover: #3ca576;
  --border-color: #e8e8e8;
  --border-radius-md: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme='dark'] {
  --border-color: #303030;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
```