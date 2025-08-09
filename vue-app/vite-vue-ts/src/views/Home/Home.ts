import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  CodeOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  CompareOutlined,
  RocketOutlined,
  BoxPlotOutlined,
  ToolOutlined,
  BlockOutlined
} from '@ant-design/icons-vue'

export function useHome() {
  const router = useRouter()

  const features = [
    {
      title: 'Composition API',
      description: '学习Vue3的组合式API，了解如何组织和重用逻辑',
      path: '/vue3/composition-api',
      icon: () => h(CodeOutlined, { style: { fontSize: '32px', color: '#42b883' } })
    },
    {
      title: '响应式系统',
      description: '深入了解Vue3的Proxy响应式系统原理',
      path: '/vue3/reactive-system',
      icon: () => h(ThunderboltOutlined, { style: { fontSize: '32px', color: '#42b883' } })
    },
    {
      title: '生命周期钩子',
      description: '掌握Vue3组件的生命周期钩子函数',
      path: '/vue3/lifecycle-hooks',
      icon: () => h(HistoryOutlined, { style: { fontSize: '32px', color: '#42b883' } })
    },
    {
      title: 'API对比',
      description: '对比Vue2与Vue3的API差异和使用方式',
      path: '/api-compare',
      icon: () => h(CompareOutlined, { style: { fontSize: '32px', color: '#42b883' } })
    }
  ]

  const benefits = [
    {
      title: '更好的性能',
      description: 'Vue3的虚拟DOM重写和编译优化使渲染速度提升高达100%',
      icon: () => h(RocketOutlined, { style: { fontSize: '24px', color: '#42b883' } })
    },
    {
      title: '更小的体积',
      description: '核心运行时压缩后仅10kb，支持按需引入',
      icon: () => h(BoxPlotOutlined, { style: { fontSize: '24px', color: '#42b883' } })
    },
    {
      title: '更强的TypeScript支持',
      description: '从底层重写，提供完整的类型推导',
      icon: () => h(ToolOutlined, { style: { fontSize: '24px', color: '#42b883' } })
    },
    {
      title: '组合式API',
      description: '更灵活的逻辑组织和复用方式',
      icon: () => h(BlockOutlined, { style: { fontSize: '24px', color: '#42b883' } })
    }
  ]

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return {
    features,
    benefits,
    navigateTo
  }
}