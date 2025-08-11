<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import Codemirror from 'vue-codemirror6'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { lintGutter } from '@codemirror/lint'
import { useAppStore } from '../stores'
import { debounce } from 'lodash-es'

interface Props {
  code: string
  language?: string
  readOnly?: boolean
  height?: string
  showLanguageSelector?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  readOnly: false,
  height: '300px',
  showLanguageSelector: false
})

const emit = defineEmits<{
  (e: 'update:code', value: string): void
  (e: 'run'): void
  (e: 'language-change', value: string): void
}>()

const appStore = useAppStore()
const editorRef = ref<any>(null)

// 编辑器内容
const editorValue = ref(props.code)
const currentLanguage = ref(props.language)

// 支持的语言列表
const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'vue', label: 'Vue' }
]

// 监听代码变化
watch(() => props.code, (newValue) => {
  if (newValue !== editorValue.value) {
    editorValue.value = newValue
  }
})

// 监听语言变化
watch(() => props.language, (newValue) => {
  if (newValue !== currentLanguage.value) {
    currentLanguage.value = newValue
  }
})

// 监听编辑器内容变化
const handleChange = (value: string) => {
  editorValue.value = value
  emit('update:code', value)
}

// 防抖保存
const debouncedSave = debounce((value: string) => {
  console.log('保存代码:', value.substring(0, 20) + '...')
}, 1000)

// 运行代码
const runCode = () => {
  emit('run')
}

// 切换语言
const changeLanguage = (lang: string) => {
  currentLanguage.value = lang
  emit('language-change', lang)
}

// 根据当前主题选择编辑器主题
const isDarkMode = computed(() => appStore.currentTheme === 'dark')

// 自定义亮色主题 (适配Ant Design Vue)
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
  },
  // 自动补全样式
  '.cm-tooltip': {
    border: '1px solid #e8e8e8',
    backgroundColor: '#ffffff'
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(66, 184, 131, 0.2)',
    color: '#333333'
  }
}, { dark: false })

// 自定义暗色主题覆盖
const darkThemeOverrides = EditorView.theme({
  '.cm-tooltip': {
    backgroundColor: '#252526',
    border: '1px solid #1e1e1e'
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(66, 184, 131, 0.3)',
    color: '#ffffff'
  }
}, { dark: true })

// Vue相关自动补全
const vueCompletions = autocompletion({
  override: [ctx => {
    // 仅在Vue文件中提供Vue特定的补全
    if (currentLanguage.value !== 'vue') return null

    const word = ctx.matchBefore(/\w*/)
    if (!word) return null

    if (word.from === word.to && !ctx.explicit) return null

    return {
      from: word.from,
      options: [
        { label: 'ref', type: 'function', info: '创建一个响应式引用' },
        { label: 'reactive', type: 'function', info: '创建一个响应式对象' },
        { label: 'computed', type: 'function', info: '创建一个计算属性' },
        { label: 'watch', type: 'function', info: '监听一个响应式数据源' },
        { label: 'watchEffect', type: 'function', info: '立即运行一个函数，同时响应式地追踪其依赖' },
        { label: 'onMounted', type: 'function', info: '在组件挂载完成后执行' },
        { label: 'onUpdated', type: 'function', info: '在组件更新完成后执行' },
        { label: 'onUnmounted', type: 'function', info: '在组件卸载前执行' },
        { label: 'defineProps', type: 'function', info: '在<script setup>中定义props' },
        { label: 'defineEmits', type: 'function', info: '在<script setup>中定义emits' },
        { label: 'defineExpose', type: 'function', info: '在<script setup>中显式暴露属性' },
        { label: 'withDefaults', type: 'function', info: '为props设置默认值' },
        { label: 'toRef', type: 'function', info: '创建一个ref，它与源属性同步' },
        { label: 'toRefs', type: 'function', info: '将响应式对象转换为普通对象，其中每个属性都是指向原始对象相应属性的ref' },
        { label: 'isRef', type: 'function', info: '检查值是否为ref对象' },
        { label: 'unref', type: 'function', info: '如果参数是ref，则返回内部值，否则返回参数本身' },
        { label: 'shallowRef', type: 'function', info: '创建一个浅层的ref' },
        { label: 'triggerRef', type: 'function', info: '手动触发与shallowRef关联的副作用' },
        { label: 'customRef', type: 'function', info: '创建一个自定义的ref' }
      ]
    }
  }]
})

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
  const langExtension = getLanguageExtension(currentLanguage.value)
  const themeExtension = isDarkMode.value ? [oneDark, darkThemeOverrides] : lightTheme

  const baseExtensions = [
    langExtension,
    themeExtension,
    EditorView.lineWrapping,
    EditorView.editable.of(!props.readOnly),
    vueCompletions,
    lintGutter()
  ]

  return baseExtensions
})

// 编辑器就绪事件
const handleReady = (editor: any) => {
  editorRef.value = editor
  console.log('编辑器已加载')
}

// 格式化代码
const formatCode = () => {
  // 简单的格式化实现
  if (!editorRef.value) return

  // 实际项目中可以集成prettier等格式化工具
  console.log('格式化代码')
}

// 组件卸载时清理
onMounted(() => {
  // 监听主题变化
  watch(() => appStore.currentTheme, () => {
    // 主题变化时重新应用扩展
    console.log('主题已更改')
  })
})
</script>

<template>
  <div class="advanced-code-editor" :class="{ 'dark-theme': isDarkMode }">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <span class="language-label">{{ currentLanguage.toUpperCase() }}</span>
        <div v-if="showLanguageSelector" class="language-selector">
          <select v-model="currentLanguage" @change="changeLanguage(currentLanguage)">
            <option v-for="lang in supportedLanguages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="format-button" @click="formatCode" title="格式化代码">
          <span class="icon">⟨⟩</span>
        </button>
        <button v-if="!readOnly" class="run-button" @click="runCode" title="运行代码">
          <span class="icon">▶</span>
        </button>
      </div>
    </div>
    <div class="editor-content" :style="{ height }">
      <Codemirror
        v-model:value="editorValue"
        :extensions="extensions"
        @change="handleChange"
        @update="debouncedSave"
        @ready="handleReady"
      />
    </div>
  </div>
</template>

<style scoped>
.advanced-code-editor {
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background-color: #ffffff;
  transition: all 0.3s;
  box-shadow: var(--box-shadow);
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

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.dark-theme .language-label {
  color: #aaa;
}

.language-selector select {
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: var(--border-radius-sm);
  padding: 2px 8px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
}

.dark-theme .language-selector select {
  border-color: #434343;
  color: #aaa;
  background-color: #252526;
}

.format-button, .run-button {
  border: none;
  border-radius: var(--border-radius-sm);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.format-button {
  background-color: transparent;
  color: #666;
}

.dark-theme .format-button {
  color: #aaa;
}

.format-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .format-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.run-button {
  background-color: var(--primary-color);
  color: white;
}

.run-button:hover {
  background-color: var(--primary-color-hover);
}

.icon {
  font-size: 14px;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 6px 8px;
  }

  .language-label {
    font-size: 0.7rem;
  }

  .format-button, .run-button {
    width: 24px;
    height: 24px;
  }

  .icon {
    font-size: 12px;
  }

  :deep(.cm-scroller) {
    font-size: 13px;
  }
}
</style>