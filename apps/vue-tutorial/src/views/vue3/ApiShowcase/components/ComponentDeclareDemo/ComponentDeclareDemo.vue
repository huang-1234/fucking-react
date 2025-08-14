<script setup lang="ts">
import type { ComponentDeclareProps, ComponentEmits } from '../../ApiShowcase'
import SimpleCodeEditor from '@/components/SimpleCodeEditor.vue'
import { optionsApiCode, compositionApiCode } from './common'
import { newBookName, handleAddBook as handleAddBookFn, handleCallback as handleCallbackFn } from './hooks'

// defineProps 和 defineEmits 的使用
const props = defineProps<ComponentDeclareProps>()
const emit = defineEmits<ComponentEmits>()

// 方法
const handleAddBook = () => handleAddBookFn(emit)
const handleCallback = () => handleCallbackFn(props.callback)
</script>

<template>
  <div class="component-declare-demo">
    <div class="demo-section">
      <h3>组件声明 API</h3>
      <p>Vue 3 提供了两种组件声明方式：Options API 和 Composition API</p>

      <div class="current-props">
        <h4>当前 Props：</h4>
        <div class="props-display">
          <p><strong>书籍：</strong> {{ props.book.title }} ({{ props.book.year }})</p>
        </div>
      </div>

      <div class="interaction-section">
        <div class="form-group">
          <input v-model="newBookName" placeholder="输入书名" />
          <button @click="handleAddBook">添加书籍</button>
          <button @click="handleCallback">调用回调</button>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>Options API vs Composition API</h4>
      <div class="code-comparison">
        <div class="code-panel">
          <h5>Options API</h5>
          <SimpleCodeEditor :code="optionsApiCode" language="javascript" :readOnly="true" height="300px" />
        </div>
        <div class="code-panel">
          <h5>Composition API</h5>
          <SimpleCodeEditor :code="compositionApiCode" language="javascript" :readOnly="true" height="300px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-declare-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.current-props {
  background-color: var(--primary-color-light);
  padding: 16px;
  border-radius: var(--border-radius-md);
  margin-bottom: 16px;
}

.props-display {
  margin-top: 8px;
}

.interaction-section {
  margin-top: 16px;
}

.form-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  flex-grow: 1;
}

button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color-hover);
}

.code-section {
  margin-top: 24px;
}

.code-comparison {
  display: flex;
  gap: 16px;
}

.code-panel {
  flex: 1;
}

h5 {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .code-comparison {
    flex-direction: column;
  }
}
</style>
