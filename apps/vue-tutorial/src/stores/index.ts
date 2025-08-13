import { defineStore } from 'pinia'
import { ref } from 'vue'

// 检测系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// 从本地存储获取主题设置
const getSavedTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
  }
  return getSystemTheme()
}

export const useAppStore = defineStore('app', () => {
  // 初始化主题
  const currentTheme = ref<'light' | 'dark'>(getSavedTheme())

  // 切换主题
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    // 保存到本地存储
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', currentTheme.value)
    }
  }

  // 设置特定主题
  function setTheme(theme: 'light' | 'dark') {
    currentTheme.value = theme
    // 保存到本地存储
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', theme)
    }
  }

  // 使用系统主题
  function useSystemTheme() {
    const theme = getSystemTheme()
    setTheme(theme)
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'system') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    useSystemTheme
  }
})