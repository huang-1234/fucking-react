<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Codemirror  from 'vue-codemirror6'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useAppStore } from '../stores'

interface Props {
  code: string
  language?: string
  readOnly?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  readOnly: false,
  height: '300px'
})

const emit = defineEmits<{
  (e: 'update:code', value: string): void
  (e: 'run'): void
}>()

const appStore = useAppStore()

// 编辑器内容
const editorValue = ref(props.code)

// 监听代码变化
watch(() => props.code, (newValue) => {
  if (newValue !== editorValue.value) {
    editorValue.value = newValue
  }
})

// 监听编辑器内容变化
const handleChange = (value: string) => {
  editorValue.value = value
  emit('update:code', value)
}

// 运行代码
const runCode = () => {
  emit('run')
}

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
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(66, 184, 131, 0.1)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(66, 184, 131, 0.1)'
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(66, 184, 131, 0.2)'
  }
}, { dark: false })

// 根据语言获取扩展
const getLanguageExtension = (lang: string) => {
  switch (lang.toLowerCase()) {
    case 'javascript':
    case 'js':
      return javascript()
    case 'typescript':
    case 'ts':
      return javascript({ typescript: true })
    case 'jsx':
      return javascript({ jsx: true })
    case 'tsx':
      return javascript({ jsx: true, typescript: true })
    case 'vue':
      // Vue文件特殊处理，使用javascript但添加Vue特定语法支持
      return javascript({ jsx: true, typescript: true })
    default:
      return javascript()
  }
}

// 编辑器扩展配置
const extensions = computed(() => {
  const langExtension = getLanguageExtension(props.language)
  const themeExtension = isDarkMode.value ? oneDark : lightTheme

  const baseExtensions = [
    langExtension,
    themeExtension,
    EditorView.lineWrapping,
    EditorView.editable.of(!props.readOnly)
  ]

  return baseExtensions
})
</script>

<template>
  <div class="code-editor-container" :class="{ 'dark-theme': isDarkMode }">
    <div class="editor-toolbar">
      <span class="language-label">{{ language }}</span>
      <button v-if="!readOnly" class="run-button" @click="runCode">运行</button>
    </div>
    <div class="editor-content" :style="{ height }">
      <Codemirror
        v-model:value="editorValue"
        :extensions="extensions"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<style scoped>
.code-editor-container {
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background-color: #ffffff;
  transition: all 0.3s;
}

.dark-theme {
  background-color: #1e1e1e;
  border-color: #303030;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.dark-theme .editor-toolbar {
  background-color: #252526;
  border-bottom: 1px solid #1e1e1e;
}

.language-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
}

.dark-theme .language-label {
  color: #aaa;
}

.run-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 4px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-button:hover {
  background-color: var(--primary-color-hover);
}

.editor-content {
  width: 100%;
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
:deep(.cm-scroller::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.cm-scroller::-webkit-scrollbar-track) {
  background: #f0f2f5;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background-color: #bfbfbf;
  border-radius: 4px;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background-color: #999;
}

/* 暗黑模式滚动条 */
.dark-theme :deep(.cm-scroller::-webkit-scrollbar-track) {
  background: #1f1f1f;
}

.dark-theme :deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background-color: #434343;
}

.dark-theme :deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background-color: #555;
}
</style>