<script setup lang="ts">
import CodeEditor from '@/components/CodeEditor.vue'
import { useAPICompare } from './APICompare'

const { examples, currentExample, nextExample, prevExample } = useAPICompare()
</script>

<template>
  <div class="api-compare">
    <h1>Vue2 vs Vue3 API 对比</h1>

    <div class="comparison-navigation">
      <button @click="prevExample" class="nav-button">&larr; 上一个</button>
      <span class="example-counter">{{ currentExample + 1 }} / {{ examples.length }}</span>
      <button @click="nextExample" class="nav-button">下一个 &rarr;</button>
    </div>

    <h2>{{ examples[currentExample].title }}</h2>

    <div class="comparison-container">
      <div class="comparison-side">
        <h3>Options API (Vue2)</h3>
        <div class="code-container">
          <CodeEditor
            :code="examples[currentExample].vue2"
            language="vue"
            :readOnly="true"
            height="500px"
          />
        </div>
      </div>

      <div class="comparison-divider">
        <div class="divider-line"></div>
        <div class="vs-badge">VS</div>
        <div class="divider-line"></div>
      </div>

      <div class="comparison-side">
        <h3>Composition API (Vue3)</h3>
        <div class="code-container">
          <CodeEditor
            :code="examples[currentExample].vue3"
            language="vue"
            :readOnly="true"
            height="500px"
          />
        </div>
      </div>
    </div>

    <div class="comparison-table">
      <h3>主要差异</h3>
      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>Options API (Vue2)</th>
            <th>Composition API (Vue3)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>数据定义</td>
            <td>data() 选项</td>
            <td>ref() / reactive()</td>
          </tr>
          <tr>
            <td>方法定义</td>
            <td>methods 选项</td>
            <td>普通函数</td>
          </tr>
          <tr>
            <td>计算属性</td>
            <td>computed 选项</td>
            <td>computed() 函数</td>
          </tr>
          <tr>
            <td>侦听器</td>
            <td>watch 选项</td>
            <td>watch() / watchEffect() 函数</td>
          </tr>
          <tr>
            <td>生命周期</td>
            <td>生命周期选项</td>
            <td>onXXX() 函数</td>
          </tr>
          <tr>
            <td>组件通信</td>
            <td>props / $emit</td>
            <td>defineProps / defineEmits</td>
          </tr>
          <tr>
            <td>逻辑复用</td>
            <td>Mixins (容易命名冲突)</td>
            <td>组合函数 (更清晰)</td>
          </tr>
          <tr>
            <td>TypeScript支持</td>
            <td>有限</td>
            <td>原生支持</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.api-compare {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.comparison-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #3ca576;
}

.example-counter {
  margin: 0 1rem;
  font-size: 1.1rem;
  color: var(--text-color);
}

.comparison-container {
  display: flex;
  margin-bottom: 3rem;
}

.comparison-side {
  flex: 1;
}

.comparison-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  margin-top: 3rem;
}

.divider-line {
  flex: 1;
  width: 1px;
  background-color: var(--border-color);
}

.vs-badge {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.code-container {
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table {
  margin-top: 3rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

tr:hover {
  background-color: rgba(66, 184, 131, 0.05);
}

@media (max-width: 900px) {
  .comparison-container {
    flex-direction: column;
  }

  .comparison-divider {
    flex-direction: row;
    padding: 1rem 0;
    margin: 1rem 0;
  }

  .divider-line {
    height: 1px;
    width: auto;
    flex: 1;
  }

  .vs-badge {
    margin: 0 1rem;
  }
}
</style>