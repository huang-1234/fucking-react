<script setup lang="ts">
import { ref } from 'vue'
import SimpleCodeEditor from '../../../../components/SimpleCodeEditor.vue'
import { useProvideDemo } from '../ApiShowcase'

// 使用依赖注入示例
const { theme, config, toggleTheme, updateConfig } = useProvideDemo()

// 控制是否显示子组件
const showChild = ref(true)

// 更新配置
const showHeader = ref(config.showHeader)
const maxItems = ref(config.maxItems)

const applyConfig = () => {
  updateConfig(showHeader.value, maxItems.value)
}

// 代码示例
const provideCode = `// 在父组件中提供数据
import { ref, reactive, provide } from 'vue'

// 创建要提供的值
const theme = ref('light')
const config = reactive({
  showHeader: true,
  maxItems: 10
})

// 提供给后代组件
provide('theme', theme)
provide('config', config)

// 提供方法
provide('toggleTheme', () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
})`

const injectCode = `// 在子组件中注入数据
import { inject } from 'vue'
import type { Ref } from 'vue'

// 注入值（带默认值）
const theme = inject<Ref<string>>('theme', ref('light'))
const config = inject('config', { showHeader: false, maxItems: 5 })

// 注入方法
const toggleTheme = inject('toggleTheme', () => {})

// 使用注入的值
console.log(theme.value) // 'light' 或 'dark'
console.log(config.showHeader) // true 或 false`

const typedInjectCode = `// TypeScript 类型支持
interface ThemeConfig {
  primary: string
  secondary: string
}

// 使用 Symbol 作为注入键，避免命名冲突
const ThemeSymbol = Symbol() as InjectionKey<Ref<ThemeConfig>>

// 提供
provide(ThemeSymbol, ref({
  primary: '#42b883',
  secondary: '#35495e'
}))

// 注入（有类型支持）
const theme = inject(ThemeSymbol)
// theme 的类型是 Ref<ThemeConfig> | undefined`
</script>

<template>
  <div class="dependency-injection-demo">
    <div class="demo-section">
      <h3>依赖注入 API</h3>
      <p>Vue 3 提供了依赖注入机制，用于跨组件传递数据</p>

      <div class="injection-examples">
        <div class="example-card">
          <h4>提供者组件</h4>
          <div class="example-content">
            <div class="theme-section">
              <p><strong>当前主题:</strong> {{ theme }}</p>
              <button @click="toggleTheme">切换主题</button>
            </div>

            <div class="config-section">
              <h5>配置</h5>
              <div class="form-group">
                <label>
                  <input type="checkbox" v-model="showHeader" />
                  显示头部
                </label>
              </div>
              <div class="form-group">
                <label>最大项目数:</label>
                <input type="number" v-model.number="maxItems" min="1" max="20" />
              </div>
              <button @click="applyConfig">应用配置</button>
            </div>

            <div class="toggle-child">
              <button @click="showChild = !showChild">
                {{ showChild ? '隐藏' : '显示' }}子组件
              </button>
            </div>
          </div>
        </div>

        <div class="example-card" v-if="showChild">
          <h4>注入者组件</h4>
          <div class="example-content">
            <child-component />
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>provide</h5>
          <SimpleCodeEditor :code="provideCode" language="javascript" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>inject</h5>
          <SimpleCodeEditor :code="injectCode" language="javascript" :readOnly="true" height="250px" />
        </div>

        <div class="code-tab">
          <h5>TypeScript 支持</h5>
          <SimpleCodeEditor :code="typedInjectCode" language="typescript" :readOnly="true" height="250px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 子组件
const ChildComponent = {
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
</script>

<style scoped>
.dependency-injection-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.injection-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.example-card {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--box-shadow);
}

.example-content {
  margin-top: 12px;
}

.theme-section {
  margin-bottom: 16px;
  padding: 12px;
  background-color: v-bind('theme === "light" ? "#f5f5f5" : "#333"');
  color: v-bind('theme === "light" ? "#333" : "#f5f5f5"');
  border-radius: var(--border-radius-sm);
  transition: all 0.3s;
}

.config-section {
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
}

.config-section h5 {
  margin-bottom: 8px;
}

.form-group {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-child {
  margin-top: 16px;
  text-align: center;
}

button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color-hover);
}

input[type="number"] {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.child-component {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: var(--border-radius-sm);
  transition: all 0.3s;
}

.child-component.dark-theme {
  background-color: #333;
  color: #f5f5f5;
}

.child-component h5 {
  margin-bottom: 8px;
}

.child-component ul {
  margin: 8px 0;
  padding-left: 20px;
}

.code-section {
  margin-top: 24px;
}

.code-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.code-tab {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
}

h5 {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .injection-examples, .code-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
