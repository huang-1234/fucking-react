<script setup lang="ts">
import SimpleCodeEditor from '@/components/SimpleCodeEditor.vue'
import { useWatchDemo } from '../../ApiShowcase'
import { watchCode, watchEffectCode, watchOptionsCode } from './common'

// 使用监听API示例
const { searchQuery, searchResults, user, updateQuery, updateUser, clearResults } = useWatchDemo()
</script>

<template>
  <div class="watch-demo">
    <div class="demo-section">
      <h3>监听 API</h3>
      <p>Vue 3 提供了多种监听响应式数据变化的方式</p>

      <div class="watch-examples">
        <div class="example-card">
          <h4>搜索示例</h4>
          <div class="example-content">
            <div class="form-group">
              <input v-model="searchQuery" placeholder="输入搜索内容" />
              <button @click="updateQuery(searchQuery)">搜索</button>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>用户信息</h4>
          <div class="example-content">
            <div class="user-info">
              <p><strong>姓名:</strong> {{ user.name }}</p>
              <p><strong>年龄:</strong> {{ user.age }}</p>
              <p><strong>城市:</strong> {{ user.address.city }}</p>
            </div>
            <div class="form-group">
              <input v-model="user.name" placeholder="更新姓名" />
              <input type="number" v-model.number="user.age" placeholder="更新年龄" />
              <button @click="updateUser('新用户', 30)">重置用户</button>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>监听结果</h4>
          <div class="example-content">
            <div class="results-container">
              <div v-for="(result, index) in searchResults" :key="index" class="result-entry">
                {{ result }}
              </div>
              <div v-if="searchResults.length === 0" class="no-results">
                暂无结果，请尝试搜索或更新用户信息
              </div>
            </div>
            <div class="actions">
              <button @click="clearResults">清除结果</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>watch</h5>
          <SimpleCodeEditor :code="watchCode" language="javascript" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>watchEffect</h5>
          <SimpleCodeEditor :code="watchEffectCode" language="javascript" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>监听选项</h5>
          <SimpleCodeEditor :code="watchOptionsCode" language="javascript" :readOnly="true" height="250px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watch-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.watch-examples {
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
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
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

.user-info {
  background-color: var(--bg-color);
  padding: 12px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 12px;
}

.user-info p {
  margin-bottom: 6px;
}

.results-container {
  height: 150px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px;
  background-color: var(--bg-color);
  margin-bottom: 12px;
}

.result-entry {
  padding: 4px 0;
  border-bottom: 1px dashed var(--border-color);
  font-family: monospace;
  font-size: 14px;
}

.result-entry:last-child {
  border-bottom: none;
}

.no-results {
  color: var(--text-color-tertiary);
  text-align: center;
  padding: 16px;
  font-style: italic;
}

.actions {
  display: flex;
  justify-content: center;
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
  .watch-examples, .code-tabs {
    grid-template-columns: 1fr;
  }

  .form-group {
    flex-direction: column;
  }
}
</style>
