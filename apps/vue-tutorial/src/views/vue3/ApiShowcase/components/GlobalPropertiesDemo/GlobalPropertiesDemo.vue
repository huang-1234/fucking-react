<script setup lang="ts">
import SimpleCodeEditor from '@/components/SimpleCodeEditor.vue'
import { useGlobalProperties } from '../../ApiShowcase'
import { globalPropertiesCode, useInComponentCode, useInSetupCode, typescriptCode } from './common'
import { selectedKey, currentDate, translationKeys } from './hooks'

// 使用全局属性示例
const { translate, formatDate } = useGlobalProperties()
</script>

<template>
  <div class="global-properties-demo">
    <div class="demo-section">
      <h3>全局属性扩展</h3>
      <p>Vue 3 允许扩展全局属性，使其在所有组件中可用</p>

      <div class="property-examples">
        <div class="example-card">
          <h4>翻译功能</h4>
          <div class="example-content">
            <div class="translation-demo">
              <div class="select-group">
                <label>选择要翻译的键：</label>
                <select v-model="selectedKey">
                  <option v-for="key in translationKeys" :key="key" :value="key">
                    {{ key }}
                  </option>
                </select>
              </div>
              <div class="result">
                <p><strong>原文：</strong> {{ selectedKey }}</p>
                <p><strong>翻译：</strong> {{ translate(selectedKey) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>日期格式化</h4>
          <div class="example-content">
            <div class="date-demo">
              <p><strong>原始日期：</strong> {{ currentDate.toString() }}</p>
              <p><strong>格式化日期：</strong> {{ formatDate(currentDate) }}</p>
              <button @click="currentDate = new Date()">更新日期</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>注册全局属性</h5>
          <SimpleCodeEditor :code="globalPropertiesCode" language="javascript" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>在模板中使用</h5>
          <SimpleCodeEditor :code="useInComponentCode" language="vue" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>在 setup 中使用</h5>
          <SimpleCodeEditor :code="useInSetupCode" language="vue" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>TypeScript 支持</h5>
          <SimpleCodeEditor :code="typescriptCode" language="typescript" :readOnly="true" height="250px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.global-properties-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.property-examples {
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

.translation-demo, .date-demo {
  padding: 12px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
}

.select-group {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

select {
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--component-bg);
}

.result {
  margin-top: 12px;
}

button {
  margin-top: 12px;
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
  .property-examples, .code-tabs {
    grid-template-columns: 1fr;
  }

  .select-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
