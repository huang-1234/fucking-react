import { ref, reactive, computed, watch, onMounted } from 'vue'

// 示例1: ref 和 reactive
export const count = ref(0)
export const user = reactive({
  name: '张三',
  age: 30,
  address: {
    city: '北京',
    district: '朝阳区'
  }
})

// 示例2: computed
export const doubleCount = computed(() => count.value * 2)
export const fullName = computed(() => {
  return `${user.name} (${user.age}岁)`
})

// 示例3: watch
watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
})

// 示例4: 自定义组合函数
export function useCounter(initialValue = 0, step = 1) {
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

// 导出组合函数
export function useCompositionAPI() {
  // 使用自定义组合函数
  const { counter: customCounter, increment, decrement, reset } = useCounter(10, 5)

  // 生命周期钩子
  onMounted(() => {
    console.log('组件已挂载')
  })

  return {
    count,
    user,
    doubleCount,
    fullName,
    customCounter,
    increment,
    decrement,
    reset
  }
}


export function useStaticData() {

  // 比较表格数据
  const comparisonColumns = [
    {
      title: '特性',
      dataIndex: 'feature',
      key: 'feature',
    },
    {
      title: 'Options API (Vue2)',
      dataIndex: 'options',
      key: 'options',
    },
    {
      title: 'Composition API (Vue3)',
      dataIndex: 'composition',
      key: 'composition',
    },
  ]

  const comparisonData = [
    {
      key: '1',
      feature: '代码组织',
      options: '按选项类型分组',
      composition: '按功能逻辑分组',
    },
    {
      key: '2',
      feature: '逻辑复用',
      options: 'Mixins (容易冲突)',
      composition: '组合函数 (更清晰)',
    },
    {
      key: '3',
      feature: 'TypeScript支持',
      options: '有限',
      composition: '完整',
    },
    {
      key: '4',
      feature: '代码提示',
      options: '有限',
      composition: '更好',
    },
    {
      key: '5',
      feature: '可读性',
      options: '简单组件更好',
      composition: '复杂组件更好',
    },
  ]

  // 代码示例
  const refReactiveCode = `// ref 用于简单值类型
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
<p>计数器: {{ count }}</p>
<p>姓名: {{ user.name }}</p>

// 在JS中使用ref需要 .value
function increment() {
  count.value++
}

// reactive对象的属性访问和修改
user.name = '李四'
user.address.city = '上海'`

  const computedCode = `// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 依赖reactive对象的计算属性
const fullName = computed(() => {
  return \`\${user.name} (\${user.age}岁)\`
})`

  const compositionFunctionCode = `// 自定义组合函数
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
  = useCounter(10, 5)`

  const lifecycleCode = `import { onMounted, onUpdated, onUnmounted } from 'vue'

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
})`

  return {
    comparisonColumns,
    comparisonData,
    refReactiveCode,
    computedCode,
    compositionFunctionCode,
    lifecycleCode
  }
}