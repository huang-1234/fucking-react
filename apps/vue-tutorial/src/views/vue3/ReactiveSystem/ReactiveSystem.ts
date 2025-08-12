import { ref, reactive, computed, watchEffect, onMounted } from 'vue'

// 响应式对象示例
export const user = reactive({
  name: '张三',
  age: 30,
  hobbies: ['阅读', '编程', '旅行'],
  address: {
    city: '北京',
    district: '朝阳区'
  }
})

// 响应式基础类型示例
export const counter = ref(0)
export const message = ref('Hello Vue3')

// 计算属性
export const doubleCounter = computed(() => counter.value * 2)

// 日志相关
export const logs = ref<string[]>([])
export const maxLogs = 5

export function addLog(message: string) {
  logs.value = [message, ...logs.value.slice(0, maxLogs - 1)]
}

// 模拟Vue3响应式系统
export const reactiveCode = `
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

// 数组操作示例
export function addHobby() {
  const newHobby = prompt('请输入新爱好:')
  if (newHobby) {
    user.hobbies.push(newHobby)
    addLog(`添加爱好: ${newHobby}`)
  }
}

export function removeHobby(index: number) {
  const removed = user.hobbies[index]
  user.hobbies.splice(index, 1)
  addLog(`删除爱好: ${removed}`)
}

// 动态属性支持演示
export function addNewProperty() {
  const key = prompt('请输入属性名:')
  const value = prompt('请输入属性值:')

  if (key && value) {
    user[key as keyof typeof user] = value as never
    addLog(`添加新属性: ${key} = ${value}`)
  }
}

// 导出组合函数
export function useReactiveSystem() {
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

  onMounted(() => {
    addLog('组件已挂载，响应式系统已初始化')
  })

  return {
    user,
    counter,
    message,
    doubleCounter,
    logs,
    reactiveCode,
    addHobby,
    removeHobby,
    addNewProperty,
    addLog
  }
}


export function useStaticData() {
  // 比较表格数据
const comparisonColumns = [
  {
    title: '特性',
    dataIndex: 'feature',
    key: 'feature',
    width: '25%',
  },
  {
    title: 'Vue2 (Object.defineProperty)',
    dataIndex: 'vue2',
    key: 'vue2',
    width: '37.5%',
  },
  {
    title: 'Vue3 (Proxy)',
    dataIndex: 'vue3',
    key: 'vue3',
    width: '37.5%',
  },
]

const comparisonData = [
  {
    key: '1',
    feature: '动态添加属性',
    vue2: '需要使用 Vue.set',
    vue3: '直接支持',
  },
  {
    key: '2',
    feature: '删除属性',
    vue2: '需要使用 Vue.delete',
    vue3: '直接支持 delete 操作符',
  },
  {
    key: '3',
    feature: '数组索引变化',
    vue2: '不能检测',
    vue3: '可以检测',
  },
  {
    key: '4',
    feature: '数组长度变化',
    vue2: '不能检测',
    vue3: '可以检测',
  },
  {
    key: '5',
    feature: 'Map/Set支持',
    vue2: '不支持',
    vue3: '完全支持',
  },
  {
    key: '6',
    feature: '性能',
    vue2: '初始化时递归遍历所有属性',
    vue3: '访问时惰性递归，性能更好',
  },
  {
    key: '7',
    feature: '浏览器兼容性',
    vue2: 'IE9+',
    vue3: '需要现代浏览器',
  },
]

const proxyAdvantages = [
  '可以拦截更多操作（如删除属性、in操作符等）',
  '可以直接监听整个对象，而不是特定属性',
  '可以监听数组索引和长度变化',
  '可以监听动态添加的属性',
  '性能更好（惰性监听，按需代理）'
]
  return {
    comparisonColumns,
    comparisonData,
    proxyAdvantages,
    reactiveCode
  }
}