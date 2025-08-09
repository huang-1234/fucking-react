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
