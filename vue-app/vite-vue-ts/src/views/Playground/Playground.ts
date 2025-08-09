import { ref } from 'vue'

// 示例代码
export const defaultVueCode = `<script setup>
import { ref, computed } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}
<\/script>

<template>
  <div class="counter-app">
    <h2>Vue3 计数器</h2>
    <p>当前计数: {{ count }}</p>
    <p>双倍值: {{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<style>
.counter-app {
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 300px;
  margin: 0 auto;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>`

// 创建预览HTML模板
export function createPreviewHtml(code: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue3 Playground</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    // 捕获控制台输出
    const originalConsole = console;
    console = {
      ...originalConsole,
      log: (...args) => {
        originalConsole.log(...args);
        window.parent.postMessage({
          type: 'console',
          method: 'log',
          args: args.map(arg => String(arg))
        }, '*');
      },
      error: (...args) => {
        originalConsole.error(...args);
        window.parent.postMessage({
          type: 'console',
          method: 'error',
          args: args.map(arg => String(arg))
        }, '*');
      },
      warn: (...args) => {
        originalConsole.warn(...args);
        window.parent.postMessage({
          type: 'console',
          method: 'warn',
          args: args.map(arg => String(arg))
        }, '*');
      }
    };

    try {
      ${compileVueCode(code)}
    } catch (error) {
      console.error(error);
    }
  <\/script>
</body>
</html>
  `
}

// 编译Vue单文件组件代码
export function compileVueCode(code: string) {
  // 简易解析Vue SFC
  const scriptMatch = code.match(/<script.*?>([\s\S]*?)<\/script>/i)
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/i)
  const styleMatch = code.match(/<style.*?>([\s\S]*?)<\/style>/i)

  let scriptContent = scriptMatch ? scriptMatch[1].trim() : ''
  const templateContent = templateMatch ? templateMatch[1].trim() : ''
  const styleContent = styleMatch ? styleMatch[1].trim() : ''

  // 检查是否使用了setup语法
  const isSetupScript = scriptMatch && scriptMatch[0].includes('setup')

  // 构建组件选项
  let componentOptions = ''

  if (isSetupScript) {
    // 提取setup内容，但移除script标签
    scriptContent = scriptContent.replace(/^import\s+.*?['"].*?['"]/gm, (match) => {
      // 将import语句转换为CDN引用
      return '// ' + match + ' - 请使用CDN引用外部库'
    })

    componentOptions = `
    // 使用setup语法
    const { setup } = Vue

    // 创建组件
    const component = {
      ${templateContent ? `template: \`${templateContent}\`` : ''},
      setup() {
        ${scriptContent}

        // 自动返回所有定义的变量
        return { ${extractSetupVariables(scriptContent)} }
      }
    }
    `
  } else {
    // 常规组件选项API
    componentOptions = `
    // 创建组件
    const component = {
      ${templateContent ? `template: \`${templateContent}\`` : ''},
      ${scriptContent}
    }
    `
  }

  // 添加样式
  const styleInjection = styleContent ? `
  // 添加样式
  const style = document.createElement('style')
  style.textContent = \`${styleContent}\`
  document.head.appendChild(style)
  ` : ''

  // 创建并挂载应用
  return `
  ${styleInjection}

  ${componentOptions}

  // 创建并挂载应用
  const app = Vue.createApp(component)
  app.mount('#app')

  console.log('Vue应用已成功挂载')
  `
}

// 从setup脚本中提取变量名
export function extractSetupVariables(script: string) {
  // 这是一个简化的实现，仅用于演示
  // 实际项目中可能需要更复杂的解析
  const constRegex = /const\s+(\w+)\s*=/g
  const letRegex = /let\s+(\w+)\s*=/g
  const functionRegex = /function\s+(\w+)\s*\(/g

  const variables: string[] = []
  let match

  while ((match = constRegex.exec(script)) !== null) {
    variables.push(match[1])
  }

  while ((match = letRegex.exec(script)) !== null) {
    variables.push(match[1])
  }

  while ((match = functionRegex.exec(script)) !== null) {
    variables.push(match[1])
  }

  return variables.join(', ')
}

// 导出组合函数
export function usePlayground() {
  // 示例代码
  const vueCode = ref(defaultVueCode)

  // 预览相关
  const previewSrc = ref('')
  const previewLoading = ref(false)
  const consoleOutput = ref<string[]>([])
  const activeTab = ref('1')

  return {
    vueCode,
    previewSrc,
    previewLoading,
    consoleOutput,
    activeTab,
    createPreviewHtml,
    compileVueCode,
    extractSetupVariables
  }
}