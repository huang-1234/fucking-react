import { ref } from 'vue'

// 状态
export const message = ref('')
export const count = ref(0)
export const isActive = ref(false)

// 事件处理
export const handleClick = (event: MouseEvent) => {
  message.value = `按钮被点击了！坐标: (${event.clientX}, ${event.clientY})`
  count.value++
}

export const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    message.value = `按下了回车键！输入内容: ${(event.target as HTMLInputElement).value}`
  }
}

export const toggleActive = () => {
  isActive.value = !isActive.value
}
