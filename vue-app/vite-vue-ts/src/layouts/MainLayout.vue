<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores'
import {
  Layout,
  Menu,
  Button,
  theme as antTheme
} from 'ant-design-vue'
import {
  HomeOutlined,
  BookOutlined,
  CodeOutlined,
  BulbOutlined,
  BulbFilled,
  AppstoreOutlined
} from '@ant-design/icons-vue'

const { Header, Content, Footer } = Layout
const { useToken } = antTheme

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 计算当前选中的菜单项
const selectedKeys = computed(() => {
  const path = route.path
  if (path.startsWith('/vue3')) return ['vue3']
  if (path === '/api-compare') return ['api-compare']
  if (path === '/playground') return ['playground']
  return ['home']
})

const menuItems = [
  {
    key: 'home',
    icon: () => h(HomeOutlined),
    label: '首页',
    onClick: () => router.push('/')
  },
  {
    key: 'vue3',
    icon: () => h(BookOutlined),
    label: 'Vue3学习',
    onClick: () => router.push('/vue3/composition-api')
  },
  {
    key: 'api-compare',
    icon: () => h(AppstoreOutlined),
    label: 'API对比',
    onClick: () => router.push('/api-compare')
  },
  {
    key: 'playground',
    icon: () => h(CodeOutlined),
    label: '交互式编辑器',
    onClick: () => router.push('/playground')
  }
]

const toggleTheme = () => {
  appStore.toggleTheme()
}
</script>

<template>
  <a-config-provider :theme="{
    algorithm: appStore.currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  }">
    <Layout class="layout">
      <Header class="header">
        <div class="logo">
          <img src="../assets/vue.svg" alt="Vue Logo" class="vue-logo" />
          <h1>Vue3 学习平台</h1>
        </div>
        <div class="header-right">
          <Menu
            v-model:selectedKeys="selectedKeys"
            mode="horizontal"
            :items="menuItems"
            class="main-menu"
          />
          <Button
            type="text"
            class="theme-toggle"
            @click="toggleTheme"
          >
            <BulbOutlined v-if="appStore.currentTheme === 'light'" />
            <BulbFilled v-else />
          </Button>
        </div>
      </Header>

      <Content class="main-content">
        <router-view />
      </Content>

      <Footer class="footer">
        Vue3 学习平台 &copy; {{ new Date().getFullYear() }}
      </Footer>
    </Layout>
  </a-config-provider>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
  background-color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vue-logo {
  height: 32px;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #42b883;
}

.header-right {
  display: flex;
  align-items: center;
}

.main-menu {
  margin-right: 20px;
  border-bottom: none;
}

.theme-toggle {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  padding: 24px;
  background-color: #f0f2f5;
}

.footer {
  text-align: center;
  padding: 16px;
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
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

:deep(.ant-layout-header) {
  background-color: #fff;
}

:deep(.ant-layout-footer) {
  background-color: #f0f2f5;
}

/* 暗黑模式样式 */
:deep([data-theme='dark']) {
  .ant-layout-header {
    background-color: #141414;
  }

  .ant-layout-content {
    background-color: #1f1f1f;
  }

  .ant-layout-footer {
    background-color: #141414;
    color: rgba(255, 255, 255, 0.65);
  }

  .logo h1 {
    color: #42b883;
  }
}
</style>