<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Layout, Menu, Card } from 'ant-design-vue'
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
  if (path.includes('api-showcase')) return ['api-showcase']
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
  },
  {
    key: 'api-showcase',
    icon: () => h(CodeOutlined),
    label: 'API 展示',
    onClick: () => router.push('/vue3/api-showcase')
  }
]
</script>

<template>
  <Layout class="vue3-layout">
    <Sider width="220" class="sidebar" :theme="'light'" breakpoint="lg" collapsible>
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
      <Card class="content-card" :bordered="false">
        <router-view />
      </Card>
    </Content>
  </Layout>
</template>

<style scoped>
.vue3-layout {
  min-height: calc(100vh - 60px - 48px - 32px);
  background-color: var(--component-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.sidebar {
  background-color: var(--component-bg);
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 15px;
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
  padding: 8px 0;
}

.content {
  padding: 12px;
  background-color: var(--bg-color);
}

.content-card {
  border-radius: var(--border-radius-md);
  min-height: calc(100vh - 60px - 48px - 32px - 24px);
}

:deep(.ant-menu-item) {
  margin: 4px 8px;
  padding-left: 16px !important;
  border-radius: var(--border-radius-sm);
  height: 40px;
  line-height: 40px;
}

:deep(.ant-menu-item-selected) {
  background-color: var(--primary-color-light) !important;
}

:deep(.ant-menu-item:hover) {
  color: var(--primary-color) !important;
}

:deep(.ant-menu-item-selected) {
  color: var(--primary-color) !important;
}

:deep(.ant-menu-item-selected::after) {
  display: none !important;
}

:deep(.ant-layout-sider-trigger) {
  background-color: var(--primary-color);
}

:deep(.ant-card-body) {
  padding: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content {
    padding: 8px;
  }

  .content-card {
    border-radius: var(--border-radius-sm);
  }

  :deep(.ant-card-body) {
    padding: 12px;
  }
}
</style>