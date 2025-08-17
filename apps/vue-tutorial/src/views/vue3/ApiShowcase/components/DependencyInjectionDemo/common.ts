// 代码示例
export const provideCode = `// 在父组件中提供数据
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

export const injectCode = `// 在子组件中注入数据
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

export const typedInjectCode = `// TypeScript 类型支持
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
