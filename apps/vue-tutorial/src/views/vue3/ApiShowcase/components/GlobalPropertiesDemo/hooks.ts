import { ref } from 'vue'

// 状态
export const selectedKey = ref('hello')
export const currentDate = ref(new Date())

// 可翻译的键
export const translationKeys = ['hello', 'welcome', 'vue']
