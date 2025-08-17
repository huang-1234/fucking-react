import { ref } from 'vue'

// 触发更新的计数器
export const updateCounter = ref(0)

// 触发组件更新
export const triggerUpdate = (addLog: (message: string) => void) => {
  updateCounter.value++
  addLog(`手动触发更新: ${updateCounter.value}`)
}
