<script setup lang="ts">
import { ref, computed } from 'vue'
import Codemirror from 'vue-codemirror6'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useAppStore } from '../stores'

interface Props {
  title: string
  description?: string
  code: string
  showOutput?: boolean
  outputHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  showOutput: false,
  outputHeight: '150px'
})

const appStore = useAppStore()
const showCode = ref(true)
const isOutputVisible = ref(props.showOutput)

// 根据当前主题选择编辑器主题
const isDarkMode = computed(() => appStore.currentTheme === 'dark')

// 自定义亮色主题
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#333333'
  },
  '.cm-content': {
    fontFamily: 'SFMono-Regular, Consolas, monospace',
    fontSize: '14px'
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#999',
    border: 'none'
  }
}, { dark: false })

// Vue语法高亮
const vueHighlighting = javascript({
  jsx: true,
  typescript: true
})

// 编辑器扩展配置
const extensions = computed(() => {
  const themeExtension = isDarkMode.value ? oneDark : lightTheme

  return [
    vueHighlighting,
    themeExtension,
    EditorView.lineWrapping,
    EditorView.editable.of(false) // 只读模式
  ]
})

// 切换代码显示
const toggleCode = () => {
  showCode.value = !showCode.value
}

// 切换输出显示
const toggleOutput = () => {
  isOutputVisible.value = !isOutputVisible.value
}

// 复制代码到剪贴板
const copyCode = () => {
  navigator.clipboard.writeText(props.code)
    .then(() => {
      alert('代码已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}
</script>

<template>
  <div class="vue-example-block" :class="{ 'dark-theme': isDarkMode }">
    <div class="example-header">
      <div class="title-section">
        <h3 class="example-title">{{ title }}</h3>
        <p v-if="description" class="example-description">{{ description }}</p>
      </div>
      <div class="header-actions">
        <button class="action-button" @click="copyCode" title="复制代码">
          <span class="icon">📋</span>
        </button>
        <button class="action-button" @click="toggleCode" title="显示/隐藏代码">
          <span class="icon">{ }</span>
        </button>
        <button v-if="showOutput" class="action-button" @click="toggleOutput" title="显示/隐藏输出">
          <span class="icon">🖥️</span>
        </button>
      </div>
    </div>

    <div v-show="showCode" class="code-container">
      <Codemirror
        :value="code"
        :extensions="extensions"
        :style="{ height: 'auto', minHeight: '100px', maxHeight: '400px' }"
      />
    </div>

    <div v-if="showOutput && isOutputVisible" class="output-container" :style="{ height: outputHeight }">
      <div class="output-header">
        <span>输出</span>
      </div>
      <div class="output-content">
        <slot name="output">
          <!-- 默认输出内容 -->
          <div class="default-output">
            <p>运行结果将显示在这里</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vue-example-block {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  margin-bottom: 24px;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: all 0.3s;
}

.dark-theme {
  background-color: #1e1e1e;
  border-color: #303030;
}

.example-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: #f5f5f5;
}

.dark-theme .example-header {
  background-color: #252526;
  border-bottom-color: #1e1e1e;
}

.title-section {
  flex: 1;
}

.example-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 600;
}

.dark-theme .example-title {
  color: #e0e0e0;
}

.example-description {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.dark-theme .example-description {
  color: #a0a0a0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.dark-theme .action-button {
  color: #a0a0a0;
}

.dark-theme .action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.icon {
  font-size: 14px;
}

.code-container {
  border-bottom: 1px solid var(--border-color);
}

.dark-theme .code-container {
  border-bottom-color: #303030;
}

.output-container {
  display: flex;
  flex-direction: column;
}

.output-header {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.dark-theme .output-header {
  background-color: #2d2d2d;
  border-bottom-color: #303030;
  color: #a0a0a0;
}

.output-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.default-output {
  color: var(--text-color-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-style: italic;
}

.dark-theme .default-output {
  color: #707070;
}

/* 覆盖CodeMirror默认样式 */
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.cm-gutters) {
  border-right: none;
}

/* 自定义滚动条 */
:deep(.cm-scroller::-webkit-scrollbar),
.output-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.cm-scroller::-webkit-scrollbar-track),
.output-content::-webkit-scrollbar-track {
  background: #f0f2f5;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb),
.output-content::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 4px;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb:hover),
.output-content::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 暗黑模式滚动条 */
.dark-theme :deep(.cm-scroller::-webkit-scrollbar-track),
.dark-theme .output-content::-webkit-scrollbar-track {
  background: #1f1f1f;
}

.dark-theme :deep(.cm-scroller::-webkit-scrollbar-thumb),
.dark-theme .output-content::-webkit-scrollbar-thumb {
  background-color: #434343;
}

.dark-theme :deep(.cm-scroller::-webkit-scrollbar-thumb:hover),
.dark-theme .output-content::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .example-header {
    padding: 8px 12px;
  }

  .example-title {
    font-size: 14px;
  }

  .example-description {
    font-size: 12px;
  }

  .action-button {
    width: 24px;
    height: 24px;
  }

  .icon {
    font-size: 12px;
  }

  :deep(.cm-scroller) {
    font-size: 13px;
  }

  .output-header {
    padding: 6px 12px;
    font-size: 12px;
  }

  .output-content {
    padding: 12px;
  }
}
</style>