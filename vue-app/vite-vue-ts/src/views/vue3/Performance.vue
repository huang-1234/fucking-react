<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import CodeEditor from '../../components/CodeEditor.vue'

// 静态树提升示例代码
const staticHoistingCode = `// 源代码
<template>
  <div>
    <h1>静态内容</h1>
    <p>这段文本永远不会改变</p>
    <div>
      <span>更多静态内容</span>
    </div>
    <div>当前计数: {{ count }}</div>
  </div>
</template>

// 编译后的渲染函数 (简化版)
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString,
  createStaticVNode as _createStaticVNode, Fragment as _Fragment } from "vue"

// 静态节点被提升到渲染函数之外
const _hoisted_1 = /*#__PURE__*/_createStaticVNode("<h1>静态内容</h1><p>这段文本永远不会改变</p><div><span>更多静态内容</span></div>", 3)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _hoisted_1,
    _createElementVNode("div", null, "当前计数: " + _toDisplayString(_ctx.count), 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}`

// Patch Flag示例代码
const patchFlagCode = `// 源代码
<template>
  <div>
    <div>静态文本</div>
    <div>{{ message }}</div>
    <div :id="dynamicId">动态属性</div>
    <div :class="{ active: isActive }">动态类名</div>
  </div>
</template>

// 编译后的渲染函数 (简化版)
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString,
  normalizeClass as _normalizeClass, Fragment as _Fragment } from "vue"

// 静态节点被提升
const _hoisted_1 = /*#__PURE__*/_createElementVNode("div", null, "静态文本", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _hoisted_1,
    _createElementVNode("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */),
    _createElementVNode("div", { id: _ctx.dynamicId }, "动态属性", 8 /* PROPS */, ["id"]),
    _createElementVNode("div", {
      class: _normalizeClass({ active: _ctx.isActive })
    }, "动态类名", 2 /* CLASS */)
  ], 64 /* STABLE_FRAGMENT */))
}`

// 事件缓存示例代码
const cacheHandlersCode = `// 源代码
<template>
  <button @click="onClick">点击</button>
</template>

// 未开启缓存时的编译输出
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("button", {
    onClick: _ctx.onClick
  }, "点击", 8 /* PROPS */, ["onClick"]))
}

// 开启缓存后的编译输出 (v-on:click.once 或 编译选项开启cacheHandlers)
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.onClick && _ctx.onClick(...args)))
  }, "点击"))
}`

// 性能优化技巧
const performanceTips = [
  {
    title: '使用v-memo减少不必要的更新',
    code: `<div v-memo="[item.id === selected]">
  {{ item.name }}
</div>`,
    description: '只有当依赖数组中的值变化时才会重新渲染'
  },
  {
    title: '使用shallowRef和shallowReactive',
    code: `// 只在顶层响应式
const state = shallowReactive({
  user: { name: '张三', settings: { theme: 'dark' } }
})

// 修改顶层属性会触发更新
state.user = { name: '李四', settings: { theme: 'light' } } // 响应式

// 修改嵌套属性不会触发更新
state.user.settings.theme = 'light' // 非响应式`,
    description: '当数据结构较大或嵌套较深时，使用浅层响应式可以提高性能'
  },
  {
    title: '使用computed缓存计算结果',
    code: `// 不好的写法 - 每次渲染都会重新计算
function expensiveComputation() {
  return list.filter(item => item.active)
    .map(item => item.value)
    .reduce((sum, value) => sum + value, 0)
}

// 好的写法 - 只有依赖变化时才重新计算
const result = computed(() => {
  return list.filter(item => item.active)
    .map(item => item.value)
    .reduce((sum, value) => sum + value, 0)
})`,
    description: '使用computed可以缓存计算结果，避免每次渲染时重复计算'
  },
  {
    title: '使用v-once渲染一次性内容',
    code: `<div v-once>
  <h1>{{ title }}</h1>
  <p>这个内容只会渲染一次，即使title变化也不会更新</p>
</div>`,
    description: '对于不需要更新的内容，使用v-once可以跳过后续的更新'
  }
]

// 模拟性能数据
const performanceData = reactive({
  vue2: {
    renderTime: 8.5,
    memoryUsage: 24.3,
    updateTime: 5.2
  },
  vue3: {
    renderTime: 3.2,
    memoryUsage: 16.8,
    updateTime: 2.1
  }
})

// 计算性能提升百分比
const improvements = computed(() => {
  return {
    renderTime: Math.round((1 - performanceData.vue3.renderTime / performanceData.vue2.renderTime) * 100),
    memoryUsage: Math.round((1 - performanceData.vue3.memoryUsage / performanceData.vue2.memoryUsage) * 100),
    updateTime: Math.round((1 - performanceData.vue3.updateTime / performanceData.vue2.updateTime) * 100)
  }
})
</script>

<template>
  <div class="performance">
    <h1>Vue3 性能优化</h1>

    <section class="example-section">
      <h2>1. 编译优化</h2>

      <div class="performance-stats">
        <div class="stat-card">
          <div class="stat-value">{{ improvements.renderTime }}%</div>
          <div class="stat-label">渲染速度提升</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ improvements.memoryUsage }}%</div>
          <div class="stat-label">内存占用减少</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ improvements.updateTime }}%</div>
          <div class="stat-label">更新性能提升</div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>静态树提升 (Static Hoisting)</h3>
          <p>静态内容只会被创建一次，并在每次渲染时重用，减少内存占用和提高渲染性能。</p>
          <div class="code-container">
            <CodeEditor
              :code="staticHoistingCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>Patch Flag (动态节点标记)</h3>
          <p>编译时标记动态内容的类型，运行时只需要关注有标记的内容，大幅提高更新性能。</p>
          <div class="code-container">
            <CodeEditor
              :code="patchFlagCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>事件处理函数缓存</h3>
          <p>缓存事件处理函数，避免组件重新渲染时创建新的函数引用。</p>
          <div class="code-container">
            <CodeEditor
              :code="cacheHandlersCode"
              language="javascript"
              :readOnly="true"
              height="300px"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>2. 性能优化最佳实践</h2>

      <div class="tips-container">
        <div v-for="(tip, index) in performanceTips" :key="index" class="tip-card">
          <h3>{{ tip.title }}</h3>
          <div class="tip-code">
            <pre><code>{{ tip.code }}</code></pre>
          </div>
          <p>{{ tip.description }}</p>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>3. Vue3 vs Vue2 性能对比</h2>

      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>性能指标</th>
              <th>Vue2</th>
              <th>Vue3</th>
              <th>提升</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>初始渲染时间</td>
              <td>{{ performanceData.vue2.renderTime }}ms</td>
              <td>{{ performanceData.vue3.renderTime }}ms</td>
              <td>
                <span class="improvement">{{ improvements.renderTime }}%</span>
              </td>
            </tr>
            <tr>
              <td>内存占用</td>
              <td>{{ performanceData.vue2.memoryUsage }}MB</td>
              <td>{{ performanceData.vue3.memoryUsage }}MB</td>
              <td>
                <span class="improvement">{{ improvements.memoryUsage }}%</span>
              </td>
            </tr>
            <tr>
              <td>更新性能</td>
              <td>{{ performanceData.vue2.updateTime }}ms</td>
              <td>{{ performanceData.vue3.updateTime }}ms</td>
              <td>
                <span class="improvement">{{ improvements.updateTime }}%</span>
              </td>
            </tr>
            <tr>
              <td>Tree-Shaking支持</td>
              <td>有限</td>
              <td>完全支持</td>
              <td>
                <span class="improvement">更小的包体积</span>
              </td>
            </tr>
            <tr>
              <td>SSR性能</td>
              <td>中等</td>
              <td>显著提升</td>
              <td>
                <span class="improvement">~2-3倍</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.performance {
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

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--text-color);
}

.example-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.optimization-item {
  padding: 1.5rem;
}

.optimization-item h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.optimization-item p {
  margin-bottom: 1.5rem;
}

.code-container {
  border-radius: 8px;
  overflow: hidden;
}

.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tip-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.tip-code {
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tip-code pre {
  margin: 0;
}

.tip-code code {
  color: #f8f8f2;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
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

.improvement {
  color: #42b883;
  font-weight: bold;
}

@media (max-width: 768px) {
  .tips-container {
    grid-template-columns: 1fr;
  }
}
</style>