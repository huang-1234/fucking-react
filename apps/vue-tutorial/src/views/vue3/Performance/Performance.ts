import { ref, reactive, computed } from 'vue'

// 静态树提升示例代码
export const staticHoistingCode = `// 源代码
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
export const patchFlagCode = `// 源代码
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
export const cacheHandlersCode = `// 源代码
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
export const performanceTips = [
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
export const performanceData = reactive({
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
export const improvements = computed(() => {
  return {
    renderTime: Math.round((1 - performanceData.vue3.renderTime / performanceData.vue2.renderTime) * 100),
    memoryUsage: Math.round((1 - performanceData.vue3.memoryUsage / performanceData.vue2.memoryUsage) * 100),
    updateTime: Math.round((1 - performanceData.vue3.updateTime / performanceData.vue2.updateTime) * 100)
  }
})

// 比较表格数据
export function useComparisonData() {
  const comparisonColumns = [
    {
      title: '性能指标',
      dataIndex: 'metric',
      key: 'metric',
      width: '25%',
    },
    {
      title: 'Vue2',
      dataIndex: 'vue2',
      key: 'vue2',
      width: '25%',
    },
    {
      title: 'Vue3',
      dataIndex: 'vue3',
      key: 'vue3',
      width: '25%',
    },
    {
      title: '提升',
      dataIndex: 'improvement',
      key: 'improvement',
      width: '25%',
    },
  ]

  const comparisonData = [
    {
      key: '1',
      metric: '初始渲染时间',
      vue2: `${performanceData.vue2.renderTime}ms`,
      vue3: `${performanceData.vue3.renderTime}ms`,
      improvement: `${improvements.value.renderTime}%`,
    },
    {
      key: '2',
      metric: '内存占用',
      vue2: `${performanceData.vue2.memoryUsage}MB`,
      vue3: `${performanceData.vue3.memoryUsage}MB`,
      improvement: `${improvements.value.memoryUsage}%`,
    },
    {
      key: '3',
      metric: '更新性能',
      vue2: `${performanceData.vue2.updateTime}ms`,
      vue3: `${performanceData.vue3.updateTime}ms`,
      improvement: `${improvements.value.updateTime}%`,
    },
    {
      key: '4',
      metric: 'Tree-Shaking支持',
      vue2: '有限',
      vue3: '完全支持',
      improvement: '更小的包体积',
    },
    {
      key: '5',
      metric: 'SSR性能',
      vue2: '中等',
      vue3: '显著提升',
      improvement: '~2-3倍',
    },
  ]

  return {
    comparisonColumns,
    comparisonData
  }
}

// 导出组合函数
export function usePerformance() {
  return {
    staticHoistingCode,
    patchFlagCode,
    cacheHandlersCode,
    performanceTips,
    performanceData,
    improvements
  }
}