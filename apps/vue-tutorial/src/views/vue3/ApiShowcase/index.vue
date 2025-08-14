<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from 'ant-design-vue'
import ComponentDeclareDemo from './components/ComponentDeclareDemo/ComponentDeclareDemo.vue'
import ReactiveDemo from './components/ReactiveDemo/ReactiveDemo.vue'
import LifecycleDemo from './components/LifecycleDemo/LifecycleDemo.vue'
import WatchDemo from './components/WatchDemo/WatchDemo.vue'
import DomEventsDemo from './components/DomEventsDemo/DomEventsDemo.vue'
import DependencyInjectionDemo from './components/DependencyInjectionDemo/DependencyInjectionDemo.vue'
import GlobalPropertiesDemo from './components/GlobalPropertiesDemo/GlobalPropertiesDemo.vue'
import BuiltInComponentsDemo from './components/BuiltInComponentsDemo/BuiltInComponentsDemo.vue'
import DirectivesDemo from './components/DirectivesDemo/DirectivesDemo.vue'

// 示例数据
const book = {
  title: 'Vue 3 完全指南',
  year: 2023
}

const handleCallback = (id: number) => {
  console.log('回调被调用，ID:', id)
  alert(`回调被调用，ID: ${id}`)
}

const handleAddBook = (payload: { bookName: string }) => {
  console.log('添加书籍:', payload.bookName)
  alert(`添加书籍: ${payload.bookName}`)
}

// 当前激活的标签页
const activeKey = ref('component-declare')
</script>

<template>
  <div class="api-showcase">
    <div class="page-header">
      <h2>Vue 3 API 展示</h2>
      <p>这个页面展示了 Vue 3 的各种 API 和使用方式，包括组件声明、响应式系统、生命周期钩子等</p>
    </div>

    <div class="tabs-container">
      <Tabs v-model:activeKey="activeKey" type="card">
        <Tabs.TabPane key="component-declare" tab="组件声明 API">
          <ComponentDeclareDemo
            :book="book"
            :callback="handleCallback"
            @addBook="handleAddBook"
          />
        </Tabs.TabPane>

        <Tabs.TabPane key="reactive" tab="响应式 API">
          <ReactiveDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="lifecycle" tab="生命周期钩子">
          <LifecycleDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="watch" tab="监听 API">
          <WatchDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="dom-events" tab="DOM 事件处理">
          <DomEventsDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="dependency-injection" tab="依赖注入">
          <DependencyInjectionDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="global-properties" tab="全局属性扩展">
          <GlobalPropertiesDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="built-in-components" tab="内置组件">
          <BuiltInComponentsDemo />
        </Tabs.TabPane>

        <Tabs.TabPane key="directives" tab="自定义指令">
          <DirectivesDemo />
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div class="page-footer">
      <p>提示：点击标签页查看不同的 API 示例和代码</p>
    </div>
  </div>
</template>

<style scoped>
.api-showcase {
  padding: 16px 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--primary-color);
}

.tabs-container {
  margin-bottom: 24px;
}

.page-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-color-tertiary);
  font-style: italic;
}

:deep(.ant-tabs-card) > .ant-tabs-nav .ant-tabs-tab {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

:deep(.ant-tabs-card) > .ant-tabs-nav .ant-tabs-tab-active {
  background-color: var(--component-bg);
  border-bottom-color: var(--component-bg);
}

:deep(.ant-tabs-card) > .ant-tabs-nav::before {
  border-bottom-color: var(--border-color);
}

:deep(.ant-tabs-content) {
  background-color: var(--component-bg);
  padding: 16px;
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
}

@media (max-width: 768px) {
  :deep(.ant-tabs-nav) {
    margin-bottom: 8px !important;
  }

  :deep(.ant-tabs-tab) {
    margin: 0 4px 0 0 !important;
    padding: 6px 12px !important;
  }

  :deep(.ant-tabs-content) {
    padding: 12px;
  }
}
</style>