<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
const handleChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  editorValue.value = target.value
  emit('update:code', target.value)
}

// 运行代码
const runCode = () => {
  emit('run')
}

// 根据当前主题选择编辑器主题
const isDarkMode = computed(() => appStore.currentTheme === 'dark')

// 语言类名
const languageClass = computed(() => {
  return `language-${props.language}`
})
</script>

<template>
  <div class="simple-code-editor" :class="{ 'dark-theme': isDarkMode }">
    <div class="editor-toolbar">
      <span class="language-label">{{ language }}</span>
      <button v-if="!readOnly" class="run-button" @click="runCode">运行</button>
    </div>
    <div class="editor-content" :style="{ height }">
      <textarea
        v-if="!readOnly"
        :value="editorValue"
        @input="handleChange"
        class="code-textarea"
        :class="languageClass"
        :spellcheck="false"
      ></textarea>
      <pre v-else class="code-pre" :class="languageClass"><code>{{ editorValue }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.simple-code-editor {
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
  position: relative;
}

.code-textarea, .code-pre {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #ffffff;
  border: none;
  resize: none;
  overflow: auto;
}

.dark-theme .code-textarea, .dark-theme .code-pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.code-pre {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 语言特定样式 - 简单版本 */
.language-javascript .keyword,
.language-typescript .keyword,
.language-vue .keyword {
  color: #569cd6;
}

.language-javascript .string,
.language-typescript .string,
.language-vue .string {
  color: #ce9178;
}

.language-javascript .comment,
.language-typescript .comment,
.language-vue .comment {
  color: #6a9955;
}

/* 自定义滚动条 */
.code-textarea::-webkit-scrollbar,
.code-pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-textarea::-webkit-scrollbar-track,
.code-pre::-webkit-scrollbar-track {
  background: #f0f2f5;
}

.code-textarea::-webkit-scrollbar-thumb,
.code-pre::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 4px;
}

.code-textarea::-webkit-scrollbar-thumb:hover,
.code-pre::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 暗黑模式滚动条 */
.dark-theme .code-textarea::-webkit-scrollbar-track,
.dark-theme .code-pre::-webkit-scrollbar-track {
  background: #1f1f1f;
}

.dark-theme .code-textarea::-webkit-scrollbar-thumb,
.dark-theme .code-pre::-webkit-scrollbar-thumb {
  background-color: #434343;
}

.dark-theme .code-textarea::-webkit-scrollbar-thumb:hover,
.dark-theme .code-pre::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
</style>