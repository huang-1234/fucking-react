import { ref } from 'vue'
import { inject } from 'vue'

// 控制是否显示子组件
export const showChild = ref(true)

// 子组件
export const ChildComponent = {
  template: `
    <div class="child-component" :class="{ 'dark-theme': theme === 'dark' }">
      <h5>子组件</h5>
      <p><strong>注入的主题:</strong> {{ theme }}</p>
      <p><strong>配置:</strong></p>
      <ul>
        <li>显示头部: {{ config.showHeader ? '是' : '否' }}</li>
        <li>最大项目数: {{ config.maxItems }}</li>
      </ul>
      <button @click="toggleTheme">切换主题</button>
    </div>
  `,
  setup() {
    const theme = inject('theme', ref('light'))
    const config = inject('config', { showHeader: false, maxItems: 5 })
    const toggleTheme = inject('toggleTheme', () => {})

    return {
      theme,
      config,
      toggleTheme
    }
  }
}
