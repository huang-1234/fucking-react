<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Layout, Menu } from 'ant-design-vue'
import {
  CodeOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  RocketOutlined
} from '@ant-design/icons-vue'

const { Sider, Content } = Layout
const router = useRouter()
const route = useRoute()

// 计算当前选中的菜单项
const selectedKeys = computed(() => {
  const path = route.path
  if (path.includes('composition-api')) return ['composition-api']
  if (path.includes('reactive-system')) return ['reactive-system']
  if (path.includes('lifecycle-hooks')) return ['lifecycle-hooks']
  if (path.includes('performance')) return ['performance']
  return ['composition-api'] // 默认选中
})

// 菜单项配置
const menuItems = [
  {
    key: 'composition-api',
    icon: () => h(CodeOutlined),
    label: 'Composition API',
    onClick: () => router.push('/vue3/composition-api')
  },
  {
    key: 'reactive-system',
    icon: () => h(ThunderboltOutlined),
    label: '响应式系统',
    onClick: () => router.push('/vue3/reactive-system')
  },
  {
    key: 'lifecycle-hooks',
    icon: () => h(HistoryOutlined),
    label: '生命周期钩子',
    onClick: () => router.push('/vue3/lifecycle-hooks')
  },
  {
    key: 'performance',
    icon: () => h(RocketOutlined),
    label: '性能优化',
    onClick: () => router.push('/vue3/performance')
  }
]
</script>

<template>
  <Layout class="vue3-layout">
    <Sider width="250" class="sidebar">
      <div class="sidebar-header">
        <h3>Vue3 学习模块</h3>
      </div>
      <Menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        class="sidebar-menu"
      />
    </Sider>
    <Content class="content">
      <router-view />
    </Content>
  </Layout>
</template>

<style scoped>
.vue3-layout {
  min-height: 100%;
  background-color: #fff;
}

.sidebar {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #42b883;
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
}

.content {
  padding: 24px;
  background-color: #fff;
}

:deep(.ant-menu-item-selected) {
  background-color: #e6f7ff !important;
}

:deep(.ant-menu-item:hover) {
  color: #42b883 !important;
}

:deep(.ant-menu-item-selected) {
  color: #42b883 !important;
}

:deep(.ant-menu-item-selected::after) {
  border-right-color: #42b883 !important;
}

/* 暗黑模式适配 */
:deep([data-theme='dark']) {
  .vue3-layout,
  .sidebar,
  .content {
    background-color: #1f1f1f;
  }

  .sidebar-header {
    border-bottom-color: #303030;
  }

  .sidebar-header h3 {
    color: #42b883;
  }
}
</style>