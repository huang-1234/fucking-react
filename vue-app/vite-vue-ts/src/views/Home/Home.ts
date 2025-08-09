import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useHome() {
  const router = useRouter()

  const features = [
    {
      title: 'Composition API',
      description: '学习Vue3的组合式API，了解如何组织和重用逻辑',
      path: '/vue3/composition-api',
      icon: '🧩'
    },
    {
      title: '响应式系统',
      description: '深入了解Vue3的Proxy响应式系统原理',
      path: '/vue3/reactive-system',
      icon: '⚡'
    },
    {
      title: '生命周期钩子',
      description: '掌握Vue3组件的生命周期钩子函数',
      path: '/vue3/lifecycle-hooks',
      icon: '🔄'
    },
    {
      title: 'API对比',
      description: '对比Vue2与Vue3的API差异和使用方式',
      path: '/api-compare',
      icon: '📊'
    }
  ]

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return {
    features,
    navigateTo
  }
}