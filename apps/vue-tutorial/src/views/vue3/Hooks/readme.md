# vue hooks

## prompt text

模仿ahooks的所有hook@https://ahooks.js.org/zh-CN/hooks/use-request/index 、使用vue的语法全部实现一遍；将所有的hooks写在下面两个文件内、基础的hook写在@base.ts 高阶的hook写在@advance.ts 相关使用文档写在@readme.md

# hooks tech

# Vue Hooks 库

基于 Vue 3 Composition API 实现的 Hooks 库，模仿 ahooks 的所有功能。

## 目录结构

- `base.ts` - 基础 Hooks
- `advance.ts` - 高阶 Hooks
- `readme.md` - 使用文档

## 基础 Hooks (base.ts)

### State Hooks

#### useToggle

用于在两个状态值间切换的 Hook。

```typescript
import { useToggle } from './base'

// 基础用法
const [state, toggle] = useToggle()
toggle() // true
toggle() // false
toggle(true) // true

// 自定义值
const [state, toggle] = useToggle('Hello', 'World')
toggle() // 'World'
toggle() // 'Hello'
toggle('Hello') // 'Hello'
```

#### useBoolean

管理 boolean 状态的 Hook。

```typescript
import { useBoolean } from './base'

const { state, toggle, setTrue, setFalse } = useBoolean()

setTrue() // state.value = true
setFalse() // state.value = false
toggle() // 切换状态
```

#### useCounter

管理计数器的 Hook。

```typescript
import { useCounter } from './base'

const { current, inc, dec, set, reset } = useCounter(0, {
  min: 0,
  max: 10
})

inc() // current.value = 1
inc(5) // current.value = 6
dec() // current.value = 5
set(8) // current.value = 8
reset() // current.value = 0
```

#### useLocalStorageState

将状态存储在 localStorage 中的 Hook。

```typescript
import { useLocalStorageState } from './base'

const [state, setState] = useLocalStorageState('my-key', 'default value')

setState('new value') // 自动同步到 localStorage
```

#### useSessionStorageState

将状态存储在 sessionStorage 中的 Hook。

```typescript
import { useSessionStorageState } from './base'

const [state, setState] = useSessionStorageState('my-key', 'default value')

setState('new value') // 自动同步到 sessionStorage
```

### Effect Hooks

#### useUpdateEffect

忽略首次执行，只在依赖更新时执行的 Hook。

```typescript
import { useUpdateEffect } from './base'
import { ref } from 'vue'

const count = ref(0)

useUpdateEffect(() => {
  console.log('count updated:', count.value)
}, [count.value])
```

#### useMount

只在组件初始化时执行的 Hook。

```typescript
import { useMount } from './base'

useMount(() => {
  console.log('Component mounted')
})
```

#### useUnmount

在组件卸载时执行的 Hook。

```typescript
import { useUnmount } from './base'

useUnmount(() => {
  console.log('Component will unmount')
})
```

#### useTimeout

一段时间内，延迟执行函数的 Hook。

```typescript
import { useTimeout } from './base'

const { clear, set } = useTimeout(() => {
  console.log('Timeout executed')
}, 1000)

// clear() 取消执行
// set() 重新设置定时器
```

#### useInterval

一段时间内，循环执行函数的 Hook。

```typescript
import { useInterval } from './base'

const { clear, set } = useInterval(() => {
  console.log('Interval executed')
}, 1000, { immediate: true })

// clear() 停止循环
// set() 重新开始循环
```

### DOM Hooks

#### useEventListener

优雅的使用 addEventListener 的 Hook。

```typescript
import { useEventListener } from './base'
import { ref } from 'vue'

const buttonRef = ref<HTMLElement>()

useEventListener('click', (event) => {
  console.log('Button clicked')
}, buttonRef.value)
```

#### useClickAway

监听目标元素外的点击事件。

```typescript
import { useClickAway } from './base'
import { ref } from 'vue'

const modalRef = ref<HTMLElement>()

useClickAway(modalRef, () => {
  console.log('Clicked outside modal')
})
```

#### useKeyPress

监听键盘按键的 Hook。

```typescript
import { useKeyPress } from './base'

// 监听单个按键
useKeyPress('Enter', (event) => {
  console.log('Enter pressed')
})

// 监听多个按键
useKeyPress(['Enter', 'Space'], (event) => {
  console.log('Enter or Space pressed')
})

// 自定义判断函数
useKeyPress((event) => event.ctrlKey && event.key === 's', (event) => {
  console.log('Ctrl+S pressed')
})
```

## 高阶 Hooks (advance.ts)

### Request Hooks

#### useRequest

强大的异步数据管理的 Hook。

```typescript
import { useRequest } from './advance'

// 基础用法
const { data, loading, error, run, runAsync } = useRequest(async (id: string) => {
  const response = await fetch(`/api/user/${id}`)
  return response.json()
})

// 手动触发
run('123')

// 带配置的用法
const { data, loading, error, run, refresh, mutate } = useRequest(
  async (id: string) => {
    const response = await fetch(`/api/user/${id}`)
    return response.json()
  },
  {
    manual: false, // 自动执行
    defaultParams: ['123'],
    onSuccess: (data, params) => {
      console.log('Success:', data)
    },
    onError: (error, params) => {
      console.log('Error:', error)
    },
    pollingInterval: 5000, // 轮询
    debounceWait: 300, // 防抖
    retryCount: 3, // 重试次数
    cacheKey: 'user-data' // 缓存
  }
)

// 刷新数据
refresh()

// 修改数据
mutate(newData)
```

### Advanced State Hooks

#### usePrevious

保存上一次状态的 Hook。

```typescript
import { usePrevious } from './advance'
import { ref } from 'vue'

const count = ref(0)
const prevCount = usePrevious(count.value)

count.value = 1
// prevCount.value = 0
```

#### useLatest

返回当前最新值的 Hook，避免闭包问题。

```typescript
import { useLatest } from './advance'
import { ref } from 'vue'

const count = ref(0)
const latestCount = useLatest(count.value)

// latestCount.value 始终是最新的 count 值
```

#### useCreation

强制创建对象的 Hook，避免重复创建。

```typescript
import { useCreation } from './advance'
import { ref } from 'vue'

const count = ref(0)

const expensiveObject = useCreation(() => {
  return new SomeExpensiveClass()
}, [count.value])
```

#### useReactive

返回一个响应式对象。

```typescript
import { useReactive } from './advance'

const state = useReactive({
  count: 0,
  name: 'John'
})

state.count++ // 响应式更新
```

#### useMap

管理 Map 类型状态的 Hook。

```typescript
import { useMap } from './advance'

const { map, set, get, remove, reset, clear } = useMap([
  ['key1', 'value1'],
  ['key2', 'value2']
])

set('key3', 'value3')
const value = get('key1')
remove('key2')
clear()
```

#### useSet

管理 Set 类型状态的 Hook。

```typescript
import { useSet } from './advance'

const { set, add, remove, reset, clear, has } = useSet([1, 2, 3])

add(4)
remove(2)
const exists = has(3)
clear()
```

### Advanced Effect Hooks

#### useDebounce

用来处理防抖值的 Hook。

```typescript
import { useDebounce } from './advance'
import { ref } from 'vue'

const input = ref('')
const debouncedInput = useDebounce(input.value, 300)

// debouncedInput 会在 input 停止变化 300ms 后更新
```

#### useThrottle

用来处理节流值的 Hook。

```typescript
import { useThrottle } from './advance'
import { ref } from 'vue'

const scrollY = ref(0)
const throttledScrollY = useThrottle(scrollY.value, 100)

// throttledScrollY 最多每 100ms 更新一次
```

#### useDebounceFn

用来处理防抖函数的 Hook。

```typescript
import { useDebounceFn } from './advance'

const [debouncedFn, cancel] = useDebounceFn(() => {
  console.log('Debounced function called')
}, 300)

debouncedFn() // 300ms 后执行
cancel() // 取消执行
```

#### useThrottleFn

用来处理节流函数的 Hook。

```typescript
import { useThrottleFn } from './advance'

const [throttledFn, cancel] = useThrottleFn(() => {
  console.log('Throttled function called')
}, 300)

throttledFn() // 最多每 300ms 执行一次
```

#### useLockFn

用于给一个异步函数增加竞态锁，防止并发执行。

```typescript
import { useLockFn } from './advance'

const lockedFn = useLockFn(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Async function completed')
})

lockedFn() // 第一次调用
lockedFn() // 第二次调用会被忽略，直到第一次完成
```

### Advanced DOM Hooks

#### useSize

监听 DOM 节点尺寸变化的 Hook。

```typescript
import { useSize } from './advance'
import { ref } from 'vue'

const elementRef = ref<HTMLElement>()
const size = useSize(elementRef)

// size.width 和 size.height 会自动更新
```

#### useScroll

监听元素滚动位置的 Hook。

```typescript
import { useScroll } from './advance'
import { ref } from 'vue'

// 监听整个页面滚动
const position = useScroll()

// 监听特定元素滚动
const elementRef = ref<HTMLElement>()
const elementPosition = useScroll(elementRef)

// position.left 和 position.top 会自动更新
```

#### useHover

监听 DOM 元素是否有鼠标悬停的 Hook。

```typescript
import { useHover } from './advance'
import { ref } from 'vue'

const elementRef = ref<HTMLElement>()
const isHovering = useHover(elementRef)

// isHovering.value 表示是否正在悬停
```

## 使用示例

### 完整的用户列表组件

```vue
<template>
  <div>
    <input
      v-model="searchTerm"
      placeholder="搜索用户..."
      @keypress="handleKeyPress"
    />

    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <div
        v-for="user in data"
        :key="user.id"
        ref="userItemRef"
        :class="{ 'hovered': isHovering }"
      >
        {{ user.name }}
      </div>
    </div>

    <div>滚动位置: {{ scrollPosition.top }}</div>
    <div>计数器: {{ counter.current }}</div>

    <button @click="counter.inc">增加</button>
    <button @click="counter.dec">减少</button>
    <button @click="refresh">刷新</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  useRequest,
  useDebounce,
  useCounter,
  useScroll,
  useHover,
  useKeyPress
} from './advance'

// 搜索功能
const searchTerm = ref('')
const debouncedSearchTerm = useDebounce(searchTerm.value, 300)

// 用户数据请求
const { data, loading, error, refresh } = useRequest(
  async (search: string) => {
    const response = await fetch(`/api/users?search=${search}`)
    return response.json()
  },
  {
    defaultParams: [''],
    refreshDeps: [debouncedSearchTerm.value]
  }
)

// 计数器
const counter = useCounter(0, { min: 0, max: 100 })

// 滚动监听
const scrollPosition = useScroll()

// 悬停监听
const userItemRef = ref<HTMLElement>()
const isHovering = useHover(userItemRef)

// 键盘监听
useKeyPress('Enter', () => {
  refresh()
})

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    refresh()
  }
}
</script>
```

## 特性

- 🚀 基于 Vue 3 Composition API
- 📦 TypeScript 支持
- 🎯 完整的 ahooks 功能覆盖
- 🔧 灵活的配置选项
- 📱 响应式设计
- 🎨 现代化的 API 设计

## 注意事项

1. 所有 Hooks 都需要在 `setup()` 函数或 `<script setup>` 中使用
2. 某些 Hooks 依赖浏览器 API，在 SSR 环境中可能需要特殊处理
3. 使用 DOM 相关的 Hooks 时，确保目标元素已经挂载
4. 异步 Hooks 会自动处理组件卸载时的清理工作

## 兼容性

- Vue 3.0+
- 现代浏览器 (支持 ES2015+)
- TypeScript 4.0+
