// 代码示例
export const globalPropertiesCode = `// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 添加全局属性
app.config.globalProperties.$translate = (key) => {
  const translations = {
    'hello': '你好',
    'welcome': '欢迎',
    'vue': 'Vue.js'
  }
  return translations[key] || key
}

app.config.globalProperties.$formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN').format(date)
}

app.mount('#app')`

export const useInComponentCode = `// 在组件中使用全局属性
<template>
  <div>
    <p>{{ $translate('hello') }}</p>
    <p>{{ $formatDate(new Date()) }}</p>
  </div>
</template>`

export const useInSetupCode = `// 在 setup 中使用全局属性
<script setup>
import { getCurrentInstance } from 'vue'

// 获取组件实例以访问全局属性
const instance = getCurrentInstance()
const { $translate, $formatDate } = instance.proxy

console.log($translate('hello')) // '你好'
console.log($formatDate(new Date())) // '2023/10/18'
</script>`

export const typescriptCode = `// 在 TypeScript 中声明全局属性
// types.d.ts
import { ComponentCustomProperties } from 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
    $formatDate: (date: Date) => string
  }
}`
