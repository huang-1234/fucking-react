<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// 示例1: ref 和 reactive
const count = ref(0)
const user = reactive({
  name: '张三',
  age: 30,
  address: {
    city: '北京',
    district: '朝阳区'
  }
})

// 示例2: computed
const doubleCount = computed(() => count.value * 2)
const fullName = computed(() => {
  return `${user.name} (${user.age}岁)`
})

// 示例3: watch
watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
})

// 示例4: 自定义组合函数
function useCounter(initialValue = 0, step = 1) {
  const counter = ref(initialValue)

  function increment() {
    counter.value += step
  }

  function decrement() {
    counter.value -= step
  }

  function reset() {
    counter.value = initialValue
  }

  return {
    counter,
    increment,
    decrement,
    reset
  }
}

// 使用自定义组合函数
const { counter: customCounter, increment, decrement, reset } = useCounter(10, 5)

// 生命周期钩子
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div class="composition-api">
    <h1>Composition API</h1>

    <section class="example-section">
      <h2>1. ref 和 reactive</h2>
      <div class="example-card">
        <div class="example-demo">
          <div class="counter-demo">
            <p>计数器: {{ count }}</p>
            <button @click="count++">增加</button>
          </div>
          <div class="user-demo">
            <h3>用户信息</h3>
            <p>姓名: <input v-model="user.name" /></p>
            <p>年龄: <input type="number" v-model.number="user.age" /></p>
            <p>城市: <input v-model="user.address.city" /></p>
            <p>区域: <input v-model="user.address.district" /></p>
            <div class="result">
              <p>当前用户: {{ user.name }}, {{ user.age }}岁</p>
              <p>地址: {{ user.address.city }} {{ user.address.district }}</p>
            </div>
          </div>
        </div>
        <div class="example-code">
          <pre><code>// ref 用于简单值类型
const count = ref(0)

// reactive 用于对象类型
const user = reactive({
  name: '张三',
  age: 30,
  address: {
    city: '北京',
    district: '朝阳区'
  }
})

// 在模板中使用时无需 .value
&lt;p&gt;计数器: {{ count }}&lt;/p&gt;
&lt;p&gt;姓名: {{ user.name }}&lt;/p&gt;

// 在JS中使用ref需要 .value
function increment() {
  count.value++
}

// reactive对象的属性访问和修改
user.name = '李四'
user.address.city = '上海'</code></pre>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>2. computed 计算属性</h2>
      <div class="example-card">
        <div class="example-demo">
          <p>计数: {{ count }}</p>
          <p>双倍计数: {{ doubleCount }}</p>
          <p>用户全名: {{ fullName }}</p>
          <button @click="count++">增加计数</button>
        </div>
        <div class="example-code">
          <pre><code>// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 依赖reactive对象的计算属性
const fullName = computed(() => {
  return `${user.name} (${user.age}岁)`
})</code></pre>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>3. 自定义组合函数</h2>
      <div class="example-card">
        <div class="example-demo">
          <p>自定义计数器: {{ customCounter }}</p>
          <div class="button-group">
            <button @click="increment">+5</button>
            <button @click="decrement">-5</button>
            <button @click="reset">重置</button>
          </div>
        </div>
        <div class="example-code">
          <pre><code>// 自定义组合函数
function useCounter(initialValue = 0, step = 1) {
  const counter = ref(initialValue)

  function increment() {
    counter.value += step
  }

  function decrement() {
    counter.value -= step
  }

  function reset() {
    counter.value = initialValue
  }

  return {
    counter,
    increment,
    decrement,
    reset
  }
}

// 使用自定义组合函数
const { counter: customCounter, increment, decrement, reset }
  = useCounter(10, 5)</code></pre>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>4. 生命周期钩子</h2>
      <div class="example-card">
        <div class="example-code">
          <pre><code>import { onMounted, onUpdated, onUnmounted } from 'vue'

// 组件挂载后
onMounted(() => {
  console.log('组件已挂载')
  // 执行初始化逻辑，如获取数据
})

// 组件更新后
onUpdated(() => {
  console.log('组件已更新')
})

// 组件卸载前
onUnmounted(() => {
  console.log('组件即将卸载')
  // 执行清理逻辑，如清除定时器
})</code></pre>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>5. Composition API vs Options API</h2>
      <div class="comparison-table">
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
              <td>代码组织</td>
              <td>按选项类型分组</td>
              <td>按功能逻辑分组</td>
            </tr>
            <tr>
              <td>逻辑复用</td>
              <td>Mixins (容易冲突)</td>
              <td>组合函数 (更清晰)</td>
            </tr>
            <tr>
              <td>TypeScript支持</td>
              <td>有限</td>
              <td>完整</td>
            </tr>
            <tr>
              <td>代码提示</td>
              <td>有限</td>
              <td>更好</td>
            </tr>
            <tr>
              <td>可读性</td>
              <td>简单组件更好</td>
              <td>复杂组件更好</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.composition-api {
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

.example-demo {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.counter-demo, .user-demo {
  margin-bottom: 1rem;
}

.user-demo input {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--text-color);
  margin-left: 0.5rem;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(66, 184, 131, 0.1);
  border-radius: 4px;
}

.example-code {
  padding: 1.5rem;
  background-color: #2d2d2d;
  overflow-x: auto;
}

.example-code pre {
  margin: 0;
}

.example-code code {
  color: #f8f8f2;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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