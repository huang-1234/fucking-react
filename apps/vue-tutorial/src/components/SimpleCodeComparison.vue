<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores'

interface Props {
  title: string
  description?: string
  leftCode: string
  rightCode: string
  leftLabel?: string
  rightLabel?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  leftLabel: 'Options API (Vue2)',
  rightLabel: 'Composition API (Vue3)',
  height: '400px'
})

const appStore = useAppStore()
const showCode = ref(true)

// 根据当前主题选择编辑器主题
const isDarkMode = computed(() => appStore.currentTheme === 'dark')

// 切换代码显示
const toggleCode = () => {
  showCode.value = !showCode.value
}

// 复制左侧代码
const copyLeftCode = () => {
  navigator.clipboard.writeText(props.leftCode)
    .then(() => {
      alert(`${props.leftLabel}代码已复制`)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 复制右侧代码
const copyRightCode = () => {
  navigator.clipboard.writeText(props.rightCode)
    .then(() => {
      alert(`${props.rightLabel}代码已复制`)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}
</script>

<template>
  <div class="code-comparison" :class="{ 'dark-theme': isDarkMode }">
    <div class="comparison-header">
      <div class="title-section">
        <h3 class="comparison-title">{{ title }}</h3>
        <p v-if="description" class="comparison-description">{{ description }}</p>
      </div>
      <div class="header-actions">
        <button class="action-button" @click="toggleCode" title="显示/隐藏代码">
          <span class="icon">{ }</span>
        </button>
      </div>
    </div>

    <div v-show="showCode" class="comparison-container">
      <div class="code-panel">
        <div class="panel-header">
          <span class="panel-title">{{ leftLabel }}</span>
          <button class="copy-button" @click="copyLeftCode" title="复制代码">
            <span class="icon">📋</span>
          </button>
        </div>
        <div class="editor-container" :style="{ height: props.height }">
          <pre class="code-pre language-vue"><code>{{ leftCode }}</code></pre>
        </div>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="vs-badge">VS</div>
        <div class="divider-line"></div>
      </div>

      <div class="code-panel">
        <div class="panel-header">
          <span class="panel-title">{{ rightLabel }}</span>
          <button class="copy-button" @click="copyRightCode" title="复制代码">
            <span class="icon">📋</span>
          </button>
        </div>
        <div class="editor-container" :style="{ height: props.height }">
          <pre class="code-pre language-vue"><code>{{ rightCode }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-comparison {
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

.comparison-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: #f5f5f5;
}

.dark-theme .comparison-header {
  background-color: #252526;
  border-bottom-color: #1e1e1e;
}

.title-section {
  flex: 1;
}

.comparison-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 600;
}

.dark-theme .comparison-title {
  color: #e0e0e0;
}

.comparison-description {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.dark-theme .comparison-description {
  color: #a0a0a0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button, .copy-button {
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

.action-button:hover, .copy-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.dark-theme .action-button, .dark-theme .copy-button {
  color: #a0a0a0;
}

.dark-theme .action-button:hover, .dark-theme .copy-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.icon {
  font-size: 14px;
}

.comparison-container {
  display: flex;
  flex-direction: row;
}

.code-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止内容溢出 */
}

.panel-header {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-theme .panel-header {
  background-color: #2d2d2d;
  border-bottom-color: #303030;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.dark-theme .panel-title {
  color: #d0d0d0;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  background-color: #f5f5f5;
}

.dark-theme .divider {
  background-color: #252526;
}

.divider-line {
  flex: 1;
  width: 1px;
  background-color: var(--border-color);
}

.dark-theme .divider-line {
  background-color: #303030;
}

.vs-badge {
  margin: 16px 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
}

.code-pre {
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
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.dark-theme .code-pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

/* 自定义滚动条 */
.code-pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-pre::-webkit-scrollbar-track {
  background: #f0f2f5;
}

.code-pre::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 4px;
}

.code-pre::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 暗黑模式滚动条 */
.dark-theme .code-pre::-webkit-scrollbar-track {
  background: #1f1f1f;
}

.dark-theme .code-pre::-webkit-scrollbar-thumb {
  background-color: #434343;
}

.dark-theme .code-pre::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comparison-container {
    flex-direction: column;
  }

  .divider {
    flex-direction: row;
    height: auto;
    padding: 8px 0;
  }

  .divider-line {
    height: 1px;
    width: auto;
    flex: 1;
  }

  .vs-badge {
    margin: 0 8px;
  }

  .comparison-header {
    padding: 8px 12px;
  }

  .comparison-title {
    font-size: 14px;
  }

  .comparison-description {
    font-size: 12px;
  }

  .panel-header {
    padding: 6px 10px;
  }

  .panel-title {
    font-size: 12px;
  }

  .action-button, .copy-button {
    width: 24px;
    height: 24px;
  }

  .icon {
    font-size: 12px;
  }

  .code-pre {
    font-size: 13px;
  }
}
</style>