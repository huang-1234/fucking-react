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