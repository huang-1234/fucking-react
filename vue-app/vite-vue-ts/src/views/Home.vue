<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
</script>

<template>
  <div class="home-container">
    <section class="hero">
      <h1>Vue3 学习平台</h1>
      <p class="subtitle">深入学习Vue3的核心特性和最佳实践</p>
      <div class="cta-buttons">
        <button class="primary-btn" @click="navigateTo('/vue3/composition-api')">
          开始学习
        </button>
        <button class="secondary-btn" @click="navigateTo('/playground')">
          在线编辑器
        </button>
      </div>
    </section>

    <section class="features">
      <h2>核心特性</h2>
      <div class="feature-grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
          @click="navigateTo(feature.path)"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section class="why-vue3">
      <h2>为什么选择Vue3?</h2>
      <div class="benefits">
        <div class="benefit">
          <h3>🚀 更好的性能</h3>
          <p>Vue3的虚拟DOM重写和编译优化使渲染速度提升高达100%</p>
        </div>
        <div class="benefit">
          <h3>📦 更小的体积</h3>
          <p>核心运行时压缩后仅10kb，支持按需引入</p>
        </div>
        <div class="benefit">
          <h3>🛠️ 更强的TypeScript支持</h3>
          <p>从底层重写，提供完整的类型推导</p>
        </div>
        <div class="benefit">
          <h3>🧩 组合式API</h3>
          <p>更灵活的逻辑组织和复用方式</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #42b883;
}

.subtitle {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  opacity: 0.8;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background-color: #42b883;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #3ca576;
}

.secondary-btn {
  background-color: transparent;
  border: 1px solid #42b883;
  color: #42b883;
}

.secondary-btn:hover {
  background-color: rgba(66, 184, 131, 0.1);
}

.features, .why-vue3 {
  margin-bottom: 3rem;
}

.features h2, .why-vue3 h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #42b883;
}

.feature-card p {
  color: var(--text-color);
  opacity: 0.8;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.benefit {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--header-bg);
}

.benefit h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.benefit p {
  color: var(--text-color);
  opacity: 0.8;
}
</style>