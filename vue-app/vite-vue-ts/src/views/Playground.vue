<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import CodeEditor from '../components/CodeEditor.vue'

// 示例代码
const vueCode = ref(`<script setup>
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
</style>`)

// 预览相关
const previewSrc = ref('')
const previewLoading = ref(false)
const consoleOutput = ref<string[]>([])
const sandboxFrame = ref<HTMLIFrameElement | null>(null)

// 运行代码
function runCode() {
  previewLoading.value = true
  consoleOutput.value = []

  try {
    // 创建预览HTML
    const html = createPreviewHtml(vueCode.value)

    // 更新iframe内容
    if (sandboxFrame.value) {
      const frameDoc = sandboxFrame.value.contentDocument || sandboxFrame.value.contentWindow?.document

      if (frameDoc) {
        frameDoc.open()
        frameDoc.write(html)
        frameDoc.close()

        // 添加控制台输出捕获
        if (sandboxFrame.value.contentWindow) {
          setupConsoleCapture(sandboxFrame.value.contentWindow)
        }
      }
    }
  } catch (error) {
    consoleOutput.value.push(`错误: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    previewLoading.value = false
  }
}

// 创建预览HTML
function createPreviewHtml(code: string) {
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
function compileVueCode(code: string) {
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
function extractSetupVariables(script: string) {
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

// 设置控制台输出捕获
function setupConsoleCapture(window: Window) {
  const messageHandler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'console') {
      const { method, args } = event.data
      const prefix = method === 'error' ? '🔴 ' : method === 'warn' ? '🟠 ' : '📘 '
      consoleOutput.value.push(`${prefix} ${args.join(' ')}`)
    }
  }

  // 移除旧的事件监听器
  window.removeEventListener('message', messageHandler)

  // 添加新的事件监听器
  window.addEventListener('message', messageHandler)
}

// 组件挂载时运行代码
onMounted(() => {
  setTimeout(() => {
    runCode()
  }, 500)
})
</script>

<template>
  <div class="playground">
    <h1>Vue3 交互式编辑器</h1>

    <div class="playground-container">
      <div class="editor-section">
        <h2>代码编辑器</h2>
        <CodeEditor
          v-model:code="vueCode"
          language="vue"
          height="500px"
          @run="runCode"
        />
        <div class="editor-actions">
          <button class="run-button" @click="runCode">运行代码</button>
        </div>
      </div>

      <div class="preview-section">
        <h2>预览</h2>
        <div class="preview-container" :class="{ loading: previewLoading }">
          <iframe
            ref="sandboxFrame"
            class="preview-frame"
            sandbox="allow-scripts allow-same-origin"
            title="Vue Preview"
          ></iframe>
          <div v-if="previewLoading" class="loading-overlay">
            <span class="loading-spinner"></span>
            <p>加载中...</p>
          </div>
        </div>

        <div class="console-output">
          <h3>控制台输出</h3>
          <div class="console-container">
            <div v-for="(log, index) in consoleOutput" :key="index" class="console-line">
              {{ log }}
            </div>
            <div v-if="consoleOutput.length === 0" class="console-empty">
              暂无输出
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
}

.editor-section, .preview-section {
  display: flex;
  flex-direction: column;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.editor-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.run-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-button:hover {
  background-color: #3ca576;
}

.preview-container {
  position: relative;
  height: 300px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 184, 131, 0.3);
  border-radius: 50%;
  border-top-color: #42b883;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.console-output {
  margin-top: 1.5rem;
}

.console-output h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.console-container {
  height: 150px;
  overflow-y: auto;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 0.5rem;
  font-family: monospace;
  color: #f0f0f0;
}

.console-line {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.console-empty {
  color: #666;
  text-align: center;
  padding: 2rem;
}

/* 暗色主题适配 */
:deep(.dark) .preview-container {
  background-color: #1e1e1e;
}

:deep(.dark) .loading-overlay {
  background-color: rgba(30, 30, 30, 0.8);
  color: #f0f0f0;
}
</style>