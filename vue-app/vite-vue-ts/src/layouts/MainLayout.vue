<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores'

const router = useRouter()
const appStore = useAppStore()

const menuItems = [
  { name: '首页', path: '/' },
  { name: 'Vue3学习', path: '/vue3/composition-api' },
  { name: 'API对比', path: '/api-compare' },
  { name: '交互式编辑器', path: '/playground' }
]

const toggleTheme = () => {
  appStore.toggleTheme()
}
</script>

<template>
  <div class="app-container" :class="appStore.currentTheme">
    <header class="header">
      <div class="logo">
        <img src="../assets/vue.svg" alt="Vue Logo" class="vue-logo" />
        <h1>Vue3 学习平台</h1>
      </div>
      <nav class="main-nav">
        <ul>
          <li v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path">{{ item.name }}</router-link>
          </li>
        </ul>
      </nav>
      <div class="theme-toggle">
        <button @click="toggleTheme">
          {{ appStore.currentTheme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>Vue3 学习平台 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container.light {
  --bg-color: #f9f9f9;
  --text-color: #333;
  --header-bg: #ffffff;
  --border-color: #eaeaea;
}

.app-container.dark {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --header-bg: #242424;
  --border-color: #444;
}

.header {
  background-color: var(--header-bg);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vue-logo {
  height: 2rem;
}

.main-nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
}

.main-nav a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
}

.main-nav a:hover::after,
.main-nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #42b883;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.footer {
  padding: 1rem 2rem;
  background-color: var(--header-bg);
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-color);
}

.theme-toggle button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}
</style>