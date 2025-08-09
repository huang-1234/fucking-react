<script setup lang="ts">
import { ref, onMounted, onUpdated, onBeforeUnmount, onUnmounted, onBeforeMount } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import { useLifecycleCode } from './LifecycleHooks'

// 生命周期演示
const count = ref(0)
const logs = ref<string[]>([])
const currentTime = ref('')

const { lifecycleCode } = useLifecycleCode()

// 添加日志
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`${timestamp}: ${message}`)
}

// 更新当前时间
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

// 模拟组件生命周期
onBeforeMount(() => {
  addLog('onBeforeMount 触发: 组件即将挂载')
})

onMounted(() => {
  addLog('onMounted 触发: 组件已挂载')
  // 启动时间更新定时器
  const timer = setInterval(updateTime, 1000)

  // 在组件卸载前清除定时器
  onBeforeUnmount(() => {
    clearInterval(timer)
    addLog('清除了定时器')
  })
})

onUpdated(() => {
  addLog(`onUpdated 触发: 组件已更新，当前计数: ${count.value}`)
})

onBeforeUnmount(() => {
  addLog('onBeforeUnmount 触发: 组件即将卸载')
})

onUnmounted(() => {
  addLog('onUnmounted 触发: 组件已卸载')
})

// 生命周期钩子代码示例

// Vue2与Vue3生命周期对比
const lifecycleComparison = [
  { vue2: 'beforeCreate', vue3: 'setup()' },
  { vue2: 'created', vue3: 'setup()' },
  { vue2: 'beforeMount', vue3: 'onBeforeMount' },
  { vue2: 'mounted', vue3: 'onMounted' },
  { vue2: 'beforeUpdate', vue3: 'onBeforeUpdate' },
  { vue2: 'updated', vue3: 'onUpdated' },
  { vue2: 'beforeDestroy', vue3: 'onBeforeUnmount' },
  { vue2: 'destroyed', vue3: 'onUnmounted' },
  { vue2: 'errorCaptured', vue3: 'onErrorCaptured' },
  { vue2: '无', vue3: 'onRenderTracked' },
  { vue2: '无', vue3: 'onRenderTriggered' }
]
</script>

<template>
  <div class="lifecycle-hooks">
    <h1>Vue3 生命周期钩子</h1>

    <section class="example-section">
      <h2>1. 生命周期演示</h2>
      <div class="example-card">
        <div class="demo-container">
          <div class="demo-panel">
            <h3>交互式演示</h3>
            <p>当前时间: {{ currentTime }}</p>
            <p>计数器: {{ count }}</p>
            <div class="button-group">
              <button @click="count++">增加计数</button>
              <button @click="count = 0">重置</button>
            </div>
            <p class="hint">尝试点击按钮，观察右侧生命周期日志</p>
          </div>

          <div class="logs-panel">
            <h3>生命周期日志</h3>
            <div class="logs-container">
              <div v-for="(log, index) in logs" :key="index" class="log-item">
                {{ log }}
              </div>
              <div v-if="logs.length === 0" class="empty-log">
                等待生命周期事件...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>2. 生命周期钩子函数</h2>
      <div class="example-card">
        <div class="code-container">
          <CodeEditor
            :code="lifecycleCode"
            language="vue"
            :readOnly="true"
            height="400px"
          />
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>3. Vue2 与 Vue3 生命周期对比</h2>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Vue2 Options API</th>
              <th>Vue3 Composition API</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in lifecycleComparison" :key="index">
              <td>{{ item.vue2 }}</td>
              <td>{{ item.vue3 }}</td>
              <td>
                <template v-if="index === 0">
                  setup函数在beforeCreate之前执行
                </template>
                <template v-else-if="index === 1">
                  setup函数包含了created的功能
                </template>
                <template v-else-if="index === 6 || index === 7">
                  名称变更，功能相同
                </template>
                <template v-else-if="index > 8">
                  Vue3新增的调试钩子
                </template>
                <template v-else>
                  功能相同，使用方式不同
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="example-section">
      <h2>4. 生命周期最佳实践</h2>
      <div class="example-card">
        <div class="best-practices">
          <div class="practice-item">
            <h3>1. 资源获取</h3>
            <p>在<code>onMounted</code>中进行API请求、DOM操作等</p>
            <pre><code>onMounted(async () => {
  const data = await fetchData()
  results.value = data
})</code></pre>
          </div>

          <div class="practice-item">
            <h3>2. 清理副作用</h3>
            <p>在<code>onBeforeUnmount</code>中清理定时器、事件监听器等</p>
            <pre><code>onMounted(() => {
  const timer = setInterval(() => {
    // 定时操作
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer) // 清理定时器
  })
})</code></pre>
          </div>

          <div class="practice-item">
            <h3>3. 组合式函数中使用</h3>
            <p>在自定义组合函数中使用生命周期钩子</p>
            <pre><code>export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}</code></pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lifecycle-hooks {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

.example-section {
  margin-bottom: 3rem;
}

.example-section h2 {
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.example-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
  }
}

.demo-panel, .logs-panel {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.demo-panel h3, .logs-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3ca576;
}

.hint {
  font-size: 0.9rem;
  color: #888;
  margin-top: 1rem;
}

.logs-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--header-bg);
}

.log-item {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-family: monospace;
  font-size: 0.9rem;
}

.log-item:last-child {
  border-bottom: none;
}

.empty-log {
  color: #888;
  text-align: center;
  padding: 2rem;
}

.code-container {
  padding: 1.5rem;
}

.comparison-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

.best-practices {
  padding: 1.5rem;
}

.practice-item {
  margin-bottom: 2rem;
}

.practice-item:last-child {
  margin-bottom: 0;
}

.practice-item h3 {
  color: #42b883;
  margin-bottom: 0.5rem;
}

.practice-item p {
  margin-bottom: 1rem;
}

.practice-item code {
  background-color: rgba(66, 184, 131, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.practice-item pre {
  background-color: #2d2d2d;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.practice-item pre code {
  color: #f8f8f2;
  background-color: transparent;
  padding: 0;
}
</style>