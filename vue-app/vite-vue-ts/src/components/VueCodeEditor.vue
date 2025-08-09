<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Codemirror from 'vue-codemirror6'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { useAppStore } from '../stores'

interface Props {
  code: string
  readOnly?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  height: '300px'
})

const emit = defineEmits<{
  (e: 'update:code', value: string): void
  (e: 'run'): void
}>()

const appStore = useAppStore()
const editorRef = ref<any>(null)

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
  }
}, { dark: false })

// Vue语法高亮
const vueHighlighting = javascript({
  jsx: true,
  typescript: true
})

// Vue相关自动补全
const vueCompletions = autocompletion({
  override: [ctx => {
    const word = ctx.matchBefore(/\w*/)
    if (!word) return null

    if (word.from === word.to && !ctx.explicit) return null

    return {
      from: word.from,
      options: [
        // Vue3 Composition API
        { label: 'ref', type: 'function', info: '创建一个响应式引用' },
        { label: 'reactive', type: 'function', info: '创建一个响应式对象' },
        { label: 'computed', type: 'function', info: '创建一个计算属性' },
        { label: 'watch', type: 'function', info: '监听一个响应式数据源' },
        { label: 'watchEffect', type: 'function', info: '立即运行一个函数，同时响应式地追踪其依赖' },
        { label: 'onMounted', type: 'function', info: '在组件挂载完成后执行' },
        { label: 'onUpdated', type: 'function', info: '在组件更新完成后执行' },
        { label: 'onUnmounted', type: 'function', info: '在组件卸载前执行' },

        // Vue3 <script setup> 宏
        { label: 'defineProps', type: 'function', info: '在<script setup>中定义props' },
        { label: 'defineEmits', type: 'function', info: '在<script setup>中定义emits' },
        { label: 'defineExpose', type: 'function', info: '在<script setup>中显式暴露属性' },
        { label: 'withDefaults', type: 'function', info: '为props设置默认值' },

        // Vue3 模板指令
        { label: 'v-if', type: 'keyword', info: '条件渲染' },
        { label: 'v-else', type: 'keyword', info: '条件渲染' },
        { label: 'v-else-if', type: 'keyword', info: '条件渲染' },
        { label: 'v-for', type: 'keyword', info: '列表渲染' },
        { label: 'v-on', type: 'keyword', info: '事件绑定 (@)' },
        { label: 'v-bind', type: 'keyword', info: '属性绑定 (:)' },
        { label: 'v-model', type: 'keyword', info: '双向绑定' },
        { label: 'v-show', type: 'keyword', info: '条件显示' },
        { label: 'v-html', type: 'keyword', info: '输出HTML' },
        { label: 'v-text', type: 'keyword', info: '输出文本' },
        { label: 'v-pre', type: 'keyword', info: '跳过编译' },
        { label: 'v-once', type: 'keyword', info: '只渲染一次' },
        { label: 'v-memo', type: 'keyword', info: '记忆化渲染' },

        // Vue3 响应式工具
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

// 编辑器扩展配置
const extensions = computed(() => {
  const themeExtension = isDarkMode.value ? oneDark : lightTheme

  return [
    vueHighlighting,
    themeExtension,
    EditorView.lineWrapping,
    EditorView.editable.of(!props.readOnly),
    vueCompletions
  ]
})

// 编辑器就绪事件
const handleReady = (editor: any) => {
  editorRef.value = editor
  console.log('Vue编辑器已加载')
}
</script>

<template>
  <div class="vue-code-editor" :class="{ 'dark-theme': isDarkMode }">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <span class="language-label">Vue</span>
        <span class="vue-badge">Vue3</span>
      </div>
      <div class="toolbar-right">
        <button v-if="!readOnly" class="run-button" @click="runCode">
          运行
        </button>
      </div>
    </div>
    <div class="editor-content" :style="{ height }">
      <Codemirror
        v-model:value="editorValue"
        :extensions="extensions"
        @change="handleChange"
        @ready="handleReady"
      />
    </div>
  </div>
</template>

<style scoped>
.vue-code-editor {
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
  text-transform: uppercase;
}

.dark-theme .language-label {
  color: #aaa;
}

.vue-badge {
  background-color: #42b883;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 6px 8px;
  }

  .language-label {
    font-size: 0.7rem;
  }

  .vue-badge {
    font-size: 0.6rem;
    padding: 1px 4px;
  }

  .run-button {
    padding: 3px 8px;
    font-size: 0.8rem;
  }

  :deep(.cm-scroller) {
    font-size: 13px;
  }
}
</style>