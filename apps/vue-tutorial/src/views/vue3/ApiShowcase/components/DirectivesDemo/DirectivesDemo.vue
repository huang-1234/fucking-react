<script setup lang="ts">
import SimpleCodeEditor from '@/components/SimpleCodeEditor.vue'
import { vFocus, vHighlight } from '../../ApiShowcase'
import {  globalDirectiveCode, localDirectiveCode, directiveHooksCode, scriptSetupDirectiveCode } from './common'
import { highlightColor  } from './hooks'
</script>

<template>
  <div class="directives-demo">
    <div class="demo-section">
      <h3>自定义指令</h3>
      <p>Vue 3 允许创建自定义指令来直接操作 DOM 元素</p>

      <div class="directive-examples">
        <div class="example-card">
          <h4>v-focus 指令</h4>
          <div class="example-content">
            <p>下面的输入框会在页面加载时自动获取焦点：</p>
            <div class="form-group">
              <input v-focus placeholder="我会自动获取焦点" />
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>v-highlight 指令</h4>
          <div class="example-content">
            <p>下面的文本会根据选择的颜色高亮显示：</p>
            <div class="highlight-demo">
              <div v-highlight="highlightColor" class="highlight-text">
                这段文本使用 v-highlight 指令高亮显示
              </div>
              <div class="color-picker">
                <label>选择高亮颜色：</label>
                <input type="color" v-model="highlightColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>全局指令</h5>
          <SimpleCodeEditor :code="globalDirectiveCode" language="javascript" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>局部指令</h5>
          <SimpleCodeEditor :code="localDirectiveCode" language="javascript" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>指令钩子函数</h5>
          <SimpleCodeEditor :code="directiveHooksCode" language="javascript" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>Script Setup 中使用</h5>
          <SimpleCodeEditor :code="scriptSetupDirectiveCode" language="vue" :readOnly="true" height="200px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.directives-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.directive-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.example-card {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--box-shadow);
}

.example-content {
  margin-top: 12px;
}

.form-group {
  margin-top: 12px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.highlight-demo {
  margin-top: 12px;
}

.highlight-text {
  padding: 16px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 12px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="color"] {
  border: none;
  border-radius: var(--border-radius-sm);
  width: 40px;
  height: 24px;
  cursor: pointer;
}

.code-section {
  margin-top: 24px;
}

.code-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.code-tab {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
}

h5 {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .directive-examples, .code-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
