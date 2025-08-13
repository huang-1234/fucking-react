import { ref, reactive, computed, onMounted, watch, watchEffect, provide, inject } from 'vue'
import type { Ref } from 'vue'

// 组件声明API示例
export interface Book {
  title: string
  year: number
}

export interface ComponentDeclareProps {
  book: Book
  callback: (id: number) => void
}

export interface ComponentEmits {
  (e: 'addBook', payload: { bookName: string }): void
  (e: 'removeBook', id: number): void
}

// 响应式API示例
export function useReactiveDemo() {
  // ref - 基础类型响应式
  const count = ref(0)

  // reactive - 对象响应式
  const state = reactive({
    name: 'Vue 3',
    version: '3.5.17',
    features: ['Composition API', 'Teleport', 'Fragments']
  })

  // computed - 计算属性
  const doubleCount = computed(() => count.value * 2)

  // 可写计算属性
  const fullName = computed({
    get: () => `${state.name} ${state.version}`,
    set: (newValue: string) => {
      const parts = newValue.split(' ')
      state.name = parts[0] || ''
      state.version = parts[1] || ''
    }
  })

  // 方法
  function increment() {
    count.value++
  }

  function addFeature(feature: string) {
    state.features.push(feature)
  }

  function updateFullName(name: string) {
    fullName.value = name
  }

  return {
    count,
    state,
    doubleCount,
    fullName,
    increment,
    addFeature,
    updateFullName
  }
}

// 生命周期钩子示例
export function useLifecycleDemo() {
  const logs = ref<string[]>([])

  function addLog(message: string) {
    logs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  }

  onMounted(() => {
    addLog('组件已挂载')
  })

  return {
    logs,
    addLog
  }
}

// 监听API示例
export function useWatchDemo() {
  const searchQuery = ref('')
  const searchResults = ref<string[]>([])
  const user = reactive({
    name: 'Vue User',
    age: 25,
    address: {
      city: 'Shanghai',
      country: 'China'
    }
  })

  // 监听单一源
  watch(searchQuery, (newVal, oldVal) => {
    searchResults.value = [`搜索结果: ${newVal}`]
  })

  // 监听多个源
  watch([() => user.name, () => user.age], ([newName, newAge], [oldName, oldAge]) => {
    searchResults.value.push(`用户信息更新: ${newName}, ${newAge}岁`)
  })

  // watchEffect (自动依赖收集)
  watchEffect(() => {
    searchResults.value.push(`当前查询: ${searchQuery.value}, 用户: ${user.name}`)
  }, {
    flush: 'post' // 在DOM更新后调用
  })

  // 方法
  function updateQuery(query: string) {
    searchQuery.value = query
  }

  function updateUser(name: string, age: number) {
    user.name = name
    user.age = age
  }

  function clearResults() {
    searchResults.value = []
  }

  return {
    searchQuery,
    searchResults,
    user,
    updateQuery,
    updateUser,
    clearResults
  }
}

// 依赖注入示例
export function useProvideDemo() {
  // 要提供的值
  const theme = ref('light')
  const config = reactive({
    showHeader: true,
    maxItems: 10
  })

  // 提供值
  provide('theme', theme)
  provide('config', config)

  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 更新配置
  function updateConfig(showHeader: boolean, maxItems: number) {
    config.showHeader = showHeader
    config.maxItems = maxItems
  }

  return {
    theme,
    config,
    toggleTheme,
    updateConfig
  }
}

export function useInjectDemo() {
  // 注入值（带默认值）
  const theme = inject<Ref<string>>('theme', ref('light'))
  const config = inject('config', reactive({
    showHeader: false,
    maxItems: 5
  }))

  return {
    theme,
    config
  }
}

// 全局API示例
export function useGlobalProperties() {
  // 在实际应用中，这些会在main.ts中注册
  const translate = (key: string) => {
    const translations: Record<string, string> = {
      'hello': '你好',
      'welcome': '欢迎',
      'vue': 'Vue.js'
    }
    return translations[key] || key
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN').format(date)
  }

  return {
    translate,
    formatDate
  }
}

// 自定义指令示例
export const vFocus = {
  mounted: (el: HTMLElement) => {
    el.focus()
  }
}

export const vHighlight = {
  beforeMount: (el: HTMLElement, binding: any) => {
    el.style.backgroundColor = binding.value || 'yellow'
  }
}

// 组合所有示例
export function useApiShowcase() {
  const reactiveDemo = useReactiveDemo()
  const lifecycleDemo = useLifecycleDemo()
  const watchDemo = useWatchDemo()
  const provideDemo = useProvideDemo()
  const injectDemo = useInjectDemo()
  const globalProperties = useGlobalProperties()

  const currentTab = ref('component-declare')

  function setTab(tab: string) {
    currentTab.value = tab
  }

  return {
    reactiveDemo,
    lifecycleDemo,
    watchDemo,
    provideDemo,
    injectDemo,
    globalProperties,
    vFocus,
    vHighlight,
    currentTab,
    setTab
  }
}
