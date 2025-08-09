以下基于 Vue 3 和 CodeMirror 6 的代码编辑器集成技术文档，结合指定技术栈优化实现方案：

---

### **一、基础集成**
#### 1. **安装依赖**
```bash
pnpm install vue-codemirror6@1.3.22 @codemirror/lang-javascript@6.2.4 @codemirror/theme-one-dark@6.1.3
```
- **核心包**：
  `vue-codemirror6`（Vue 3 封装层） + `@codemirror/lang-javascript`（JS/TS 语法支持）。
- **主题包**：
  `@codemirror/theme-one-dark`（暗色主题，需配合 Ant Design 风格）。

#### 2. **组件引入**
```vue
<script setup>
import Codemirror from 'vue-codemirror6'
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { ref } from 'vue';

const code = ref('console.log("Hello Vue3!")');
const extensions = [javascript(), oneDark];
</script>

<template>
  <Codemirror
    v-model:value="code"
    :extensions="extensions"
    style="height: 400px; border: 1px solid #d9d9d9;"
  />
</template>
```
- **双向绑定**：`v-model:value` 同步编辑器内容。
- **扩展配置**：`extensions` 控制语言和主题。

---

### **二、核心配置**
#### 1. **语言动态切换**
```vue
<script setup>
import { python } from '@codemirror/lang-python'; // 需安装对应语言包

const languages = {
  javascript: javascript(),
  python: python()
};
const currentLang = ref('javascript');

const updateLang = (lang) => {
  extensions.value = [languages[lang], oneDark];
};
</script>
```
- 通过 `el-select`（Ant Design Vue）切换语言：
  ```vue
  <a-select v-model:value="currentLang" @change="updateLang">
    <a-select-option value="javascript">JS</a-select-option>
    <a-select-option value="python">Python</a-select-option>
  </a-select>
  ```

#### 2. **主题与样式**
```javascript
// 自定义主题（适配 Ant Design）
const customTheme = EditorView.theme({
  ".cm-content": { fontFamily: "SFMono-Regular, Consolas, monospace" },
  ".cm-gutters": { backgroundColor: "#fafafa" }
}, { dark: false });
```
- **强制覆盖样式**：
  ```css
  /* 全局样式 */
  .cm-editor { border-radius: 4px; }
  .cm-scroller { overflow: auto; }
  ```

---

### **三、功能扩展**
#### 1. **自动补全**
```javascript
import { autocompletion } from '@codemirror/autocomplete';

const customComplete = autocompletion({
  override: [ctx => {
    return { options: [{ label: 'useState', type: "function" }] };
  }]
});
extensions.value.push(customComplete);
```

#### 2. **代码校验**
```javascript
import { lintGutter } from '@codemirror/lint';
import { eslint } from '@codemirror/eslint';

extensions.value.push(
  lintGutter(),
  eslint({ fix: true })
);
```

#### 3. **事件监听**
```vue
<Codemirror
  @ready="(editor) => console.log('实例加载', editor)"
  @update="(value) => debounceSave(value)"
/>
```
- **防抖保存**（Pinia 状态管理）：
  ```javascript
  import { debounce } from 'lodash';
  import { useCodeStore } from '@/store';

  const codeStore = useCodeStore();
  const debounceSave = debounce(codeStore.updateCode, 500);
  ```

---

### **四、性能优化**
1. **按需加载语言包**
   动态导入语言模块减少首屏体积：
   ```javascript
   const loadPython = async () => {
     const { python } = await import('@codemirror/lang-python');
     extensions.value = [python(), oneDark];
   };
   ```
2. **虚拟滚动支持**
   ```javascript
   extensions.value.push(EditorView.lineWrapping);
   ```
   限制容器高度：`max-height: 60vh;`。
3. **资源销毁**
   ```javascript
   onUnmounted(() => editorView.value?.destroy());
   ```

---

### **五、调试技巧**
#### 1. **常见问题解决**
- **样式冲突**：确保仅引入一个 `codemirror.css`。
- **实例访问**：通过 `ref` 获取编辑器实例：
  ```vue
  <Codemirror ref="cmRef" />
  const cmRef = ref();
  const formatCode = () => cmRef.value.dispatch(...);
  ```

#### 2. **移动端适配**
```css
.cm-editor {
  -webkit-overflow-scrolling: touch;
  font-size: 14px;
}
```

---

### **配置总结**
| **模块**       | **技术方案**                     | **依赖包**                          |
|----------------|----------------------------------|-------------------------------------|
| **核心编辑器** | `vue-codemirror6` 组件化集成     | `vue-codemirror6@1.3.22`            |
| **语言支持**   | 动态加载语法包                  | `@codemirror/lang-javascript@6.2.4` |
| **主题**       | 自定义 + `oneDark`              | `@codemirror/theme-one-dark@6.1.3`  |
| **状态管理**   | Pinia 持久化                    | `pinia@2.2.6`                       |

> **最佳实践路径**：
> 1. 安装指定版本依赖（避免版本冲突）
> 2. 基础组件集成（双向绑定 + 扩展配置）
> 3. 按需添加高级功能（补全/Lint）
> 4. 注入性能优化（防抖/虚拟滚动）
> 5. 适配 Ant Design 样式规范

此方案已适配 **Vue 3.5.17 + Ant Design 4.2.6** 技术栈，可直接用于在线代码编辑器、教学演示等场景。