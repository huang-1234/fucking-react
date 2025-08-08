<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  code: string
  language?: string
  readOnly?: boolean
  height?: string
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  readOnly: false,
  height: '300px',
  theme: 'dark'
})

const emit = defineEmits<{
  (e: 'update:code', value: string): void
  (e: 'run'): void
}>()

const editorValue = ref(props.code)
const editorContainer = ref<HTMLElement | null>(null)
let editor: any = null

// 监听代码变化
watch(() => props.code, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

// 初始化编辑器
onMounted(async () => {
  if (typeof window !== 'undefined' && editorContainer.value) {
    // 这里我们假设monaco编辑器已经通过CDN或其他方式加载
    // 在实际项目中，你需要安装并导入monaco-editor
    if (window.monaco) {
      initMonaco()
    } else {
      // 如果monaco未加载，显示一个简单的textarea作为替代
      createFallbackEditor()
    }
  }
})

// 初始化Monaco编辑器
function initMonaco() {
  if (!editorContainer.value || !window.monaco) return

  // 设置编辑器主题
  const theme = props.theme === 'dark' ? 'vs-dark' : 'vs'

  // 创建编辑器实例
  editor = window.monaco.editor.create(editorContainer.value, {
    value: props.code,
    language: props.language,
    theme,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    readOnly: props.readOnly,
    fontSize: 14,
    tabSize: 2,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
  })

  // 监听编辑器内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    editorValue.value = value
    emit('update:code', value)
  })
}

// 创建后备编辑器（如果Monaco不可用）
function createFallbackEditor() {
  if (!editorContainer.value) return

  const textarea = document.createElement('textarea')
  textarea.value = props.code
  textarea.style.width = '100%'
  textarea.style.height = props.height
  textarea.style.padding = '8px'
  textarea.style.boxSizing = 'border-box'
  textarea.style.fontFamily = 'monospace'
  textarea.style.fontSize = '14px'
  textarea.style.border = '1px solid #ccc'
  textarea.style.borderRadius = '4px'
  textarea.readOnly = props.readOnly

  if (props.theme === 'dark') {
    textarea.style.backgroundColor = '#1e1e1e'
    textarea.style.color = '#d4d4d4'
  }

  textarea.addEventListener('input', () => {
    editorValue.value = textarea.value
    emit('update:code', textarea.value)
  })

  editorContainer.value.appendChild(textarea)
}

// 运行代码
function runCode() {
  emit('run')
}
</script>

<template>
  <div class="code-editor-container">
    <div class="editor-toolbar">
      <span class="language-label">{{ language }}</span>
      <button v-if="!readOnly" class="run-button" @click="runCode">运行</button>
    </div>
    <div ref="editorContainer" class="editor-content" :style="{ height }"></div>
  </div>
</template>

<style scoped>
.code-editor-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background-color: #1e1e1e;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #444;
}

.language-label {
  font-size: 0.8rem;
  color: #aaa;
  text-transform: uppercase;
}

.run-button {
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-button:hover {
  background-color: #3ca576;
}

.editor-content {
  width: 100%;
}

/* 适配浅色主题 */
:deep(.light) .code-editor-container {
  background-color: #f5f5f5;
  border-color: #ddd;
}

:deep(.light) .editor-toolbar {
  background-color: #e8e8e8;
  border-color: #ddd;
}

:deep(.light) .language-label {
  color: #666;
}
</style>