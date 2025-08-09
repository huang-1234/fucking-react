<script setup lang="ts">
import { watch } from 'vue'
import { useAppStore } from './stores'
import MainLayout from './layouts/MainLayout.vue'

const appStore = useAppStore()

// 监听主题变化，设置HTML属性
watch(
  () => appStore.currentTheme,
  (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  },
  { immediate: true }
)
</script>

<template>
  <MainLayout />
</template>

<style>
:root {
  --primary-color: #42b883;
  --primary-color-hover: #3ca576;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f0f2f5;
}

::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 暗黑模式滚动条 */
[data-theme='dark'] ::-webkit-scrollbar-track {
  background: #1f1f1f;
}

[data-theme='dark'] ::-webkit-scrollbar-thumb {
  background-color: #434343;
}

[data-theme='dark'] ::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

/* 自定义Ant Design Vue主题色 */
:root {
  --ant-primary-color: #42b883;
  --ant-primary-color-hover: #3ca576;
  --ant-primary-color-active: #35945f;
  --ant-primary-color-outline: rgba(66, 184, 131, 0.2);
}

.ant-btn-primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.ant-btn-primary:hover,
.ant-btn-primary:focus {
  background-color: var(--primary-color-hover) !important;
  border-color: var(--primary-color-hover) !important;
}
</style>