<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onMounted } from 'vue'

// 响应式对象示例
const user = reactive({
  name: '张三',
  age: 30,
  hobbies: ['阅读', '编程', '旅行'],
  address: {
    city: '北京',
    district: '朝阳区'
  }
})

// 响应式基础类型示例
const counter = ref(0)
const message = ref('Hello Vue3')

// 计算属性
const doubleCounter = computed(() => counter.value * 2)

// 监听响应式变化
const logs = ref<string[]>([])
const maxLogs = 5

function addLog(message: string) {
  logs.value = [message, ...logs.value.slice(0, maxLogs - 1)]
}

// 使用watchEffect监听响应式数据变化
watchEffect(() => {
  addLog(`counter值变为: ${counter.value}, 双倍值: ${doubleCounter.value}`)
})

watchEffect(() => {
  addLog(`用户名变为: ${user.name}`)
})

watchEffect(() => {
  addLog(`用户年龄变为: ${user.age}`)
})

// 数组操作示例
function addHobby() {
  const newHobby = prompt('请输入新爱好:')
  if (newHobby) {
    user.hobbies.push(newHobby)
    addLog(`添加爱好: ${newHobby}`)
  }
}

function removeHobby(index: number) {
  const removed = user.hobbies[index]
  user.hobbies.splice(index, 1)
  addLog(`删除爱好: ${removed}`)
}

// 模拟Vue3响应式系统
const reactiveCode = `
// Vue3 Proxy响应式系统简化实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key)

      const value = Reflect.get(target, key, receiver)
      // 如果是对象，则递归设置为响应式
      if (typeof value === 'object' && value !== null) {
        return reactive(value)
      }
      return value
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)

      if (oldValue !== value) {
        // 触发更新
        trigger(target, key)
      }
      return result
    },

    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (hadKey && result) {
        // 触发更新
        trigger(target, key)
      }
      return result
    }
  })
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}
`

// 动态属性支持演示
function addNewProperty() {
  const key = prompt('请输入属性名:')
  const value = prompt('请输入属性值:')

  if (key && value) {
    user[key as keyof typeof user] = value as any
    addLog(`添加新属性: ${key} = ${value}`)
  }
}

onMounted(() => {
  addLog('组件已挂载，响应式系统已初始化')
})
</script>

<template>
  <div class="reactive-system">
    <h1>Vue3 响应式系统</h1>

    <section class="example-section">
      <h2>1. Proxy 响应式原理</h2>
      <div class="example-card">
        <div class="example-content">
          <p>Vue3使用ES6 Proxy实现响应式系统，相比Vue2的Object.defineProperty有以下优势：</p>
          <ul>
            <li>可以拦截更多操作（如删除属性、in操作符等）</li>
            <li>可以直接监听整个对象，而不是特定属性</li>
            <li>可以监听数组索引和长度变化</li>
            <li>可以监听动态添加的属性</li>
            <li>性能更好（惰性监听，按需代理）</li>
          </ul>

          <div class="code-block">
            <pre><code>{{ reactiveCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>2. 响应式演示</h2>
      <div class="example-card">
        <div class="example-demo">
          <div class="demo-panel">
            <h3>基础类型响应式 (ref)</h3>
            <div class="demo-row">
              <span>计数器:</span>
              <div class="control-group">
                <input type="number" v-model.number="counter" />
                <button @click="counter++">+1</button>
                <button @click="counter--">-1</button>
              </div>
            </div>
            <div class="demo-row">
              <span>双倍值:</span>
              <span>{{ doubleCounter }}</span>
            </div>
            <div class="demo-row">
              <span>消息:</span>
              <input v-model="message" />
            </div>
          </div>

          <div class="demo-panel">
            <h3>对象响应式 (reactive)</h3>
            <div class="demo-row">
              <span>姓名:</span>
              <input v-model="user.name" />
            </div>
            <div class="demo-row">
              <span>年龄:</span>
              <input type="number" v-model.number="user.age" />
            </div>
            <div class="demo-row">
              <span>城市:</span>
              <input v-model="user.address.city" />
            </div>
            <div class="demo-row">
              <span>区域:</span>
              <input v-model="user.address.district" />
            </div>
            <button @click="addNewProperty">添加新属性</button>
          </div>

          <div class="demo-panel">
            <h3>数组响应式</h3>
            <div class="demo-row">
              <span>爱好:</span>
              <div class="hobby-list">
                <div v-for="(hobby, index) in user.hobbies" :key="hobby" class="hobby-item">
                  {{ hobby }}
                  <button @click="removeHobby(index)" class="remove-btn">×</button>
                </div>
                <button @click="addHobby" class="add-btn">添加爱好</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>3. 响应式变化日志</h2>
      <div class="example-card">
        <div class="logs-panel">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            {{ log }}
          </div>
          <div v-if="logs.length === 0" class="empty-log">
            尝试修改上面的值，这里会显示变化日志
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>4. Vue2 vs Vue3 响应式系统对比</h2>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>Vue2 (Object.defineProperty)</th>
              <th>Vue3 (Proxy)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>动态添加属性</td>
              <td>需要使用 Vue.set</td>
              <td>直接支持</td>
            </tr>
            <tr>
              <td>删除属性</td>
              <td>需要使用 Vue.delete</td>
              <td>直接支持 delete 操作符</td>
            </tr>
            <tr>
              <td>数组索引变化</td>
              <td>不能检测</td>
              <td>可以检测</td>
            </tr>
            <tr>
              <td>数组长度变化</td>
              <td>不能检测</td>
              <td>可以检测</td>
            </tr>
            <tr>
              <td>Map/Set支持</td>
              <td>不支持</td>
              <td>完全支持</td>
            </tr>
            <tr>
              <td>性能</td>
              <td>初始化时递归遍历所有属性</td>
              <td>访问时惰性递归，性能更好</td>
            </tr>
            <tr>
              <td>浏览器兼容性</td>
              <td>IE9+</td>
              <td>需要现代浏览器</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reactive-system {
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

.example-content {
  padding: 1.5rem;
}

.example-content ul {
  margin-bottom: 1.5rem;
}

.example-content li {
  margin-bottom: 0.5rem;
}

.code-block {
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  color: #f8f8f2;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.example-demo {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.demo-panel {
  background-color: var(--bg-color);
  padding: 1.5rem;
  border-radius: 8px;
}

.demo-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.demo-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.demo-row > span:first-child {
  width: 80px;
  font-weight: 500;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

input {
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--text-color);
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

.hobby-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hobby-item {
  display: flex;
  align-items: center;
  background-color: rgba(66, 184, 131, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.remove-btn {
  background: none;
  color: #ff6b6b;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
}

.add-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}

.logs-panel {
  padding: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-family: monospace;
}

.log-item:last-child {
  border-bottom: none;
}

.empty-log {
  color: #999;
  text-align: center;
  padding: 2rem;
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
</style>