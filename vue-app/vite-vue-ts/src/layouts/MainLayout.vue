<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores'
import {
  Layout,
  Menu,
  Button,
  theme as antTheme,
  Affix
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
    token: {
      colorPrimary: '#42b883',
      borderRadius: 8
    }
  }">
    <Layout class="layout">
      <Affix>
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
              type="primary"
              shape="circle"
              class="theme-toggle"
              @click="toggleTheme"
            >
              <BulbOutlined v-if="appStore.currentTheme === 'light'" />
              <BulbFilled v-else />
            </Button>
          </div>
        </Header>
      </Affix>

      <Content class="main-content">
        <div class="content-container">
          <router-view />
        </div>
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
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
  background-color: var(--component-bg);
  box-shadow: var(--box-shadow);
  z-index: 1000;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vue-logo {
  height: 28px;
}

.logo h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.main-menu {
  margin-right: 16px;
  border-bottom: none;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.main-content {
  padding: 16px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px - 48px); /* 减去header和footer的高度 */
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--component-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow);
  padding: 16px;
  min-height: calc(100vh - 60px - 48px - 32px); /* 减去内外边距 */
}

.footer {
  text-align: center;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-color-tertiary);
  background-color: var(--component-bg);
}

:deep(.ant-menu-horizontal) {
  border-bottom: none;
}

:deep(.ant-menu-item) {
  border-radius: var(--border-radius-sm);
  margin: 0 4px;
}

:deep(.ant-menu-item:hover) {
  color: var(--primary-color) !important;
  background-color: var(--primary-color-light);
}

:deep(.ant-menu-item-selected) {
  color: var(--primary-color) !important;
  background-color: var(--primary-color-light) !important;
}

:deep(.ant-menu-item-selected::after) {
  display: none !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }

  .logo h1 {
    display: none;
  }

  .main-content {
    padding: 12px;
  }

  .content-container {
    padding: 12px;
  }
}
</style>