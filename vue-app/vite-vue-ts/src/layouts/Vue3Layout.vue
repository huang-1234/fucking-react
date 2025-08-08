<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const subMenuItems = [
  { name: 'Composition API', path: '/vue3/composition-api' },
  { name: '响应式系统', path: '/vue3/reactive-system' },
  { name: '生命周期钩子', path: '/vue3/lifecycle-hooks' },
  { name: '性能优化', path: '/vue3/performance' }
]
</script>

<template>
  <div class="vue3-layout">
    <aside class="sidebar">
      <h3>Vue3 学习模块</h3>
      <nav class="sub-nav">
        <ul>
          <li v-for="item in subMenuItems" :key="item.path">
            <router-link :to="item.path">{{ item.name }}</router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.vue3-layout {
  display: flex;
  min-height: 100%;
}

.sidebar {
  width: 250px;
  padding: 1.5rem;
  border-right: 1px solid var(--border-color);
}

.sidebar h3 {
  margin-top: 0;
  color: #42b883;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sub-nav ul {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
}

.sub-nav li {
  margin-bottom: 0.75rem;
}

.sub-nav a {
  display: block;
  padding: 0.5rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sub-nav a:hover,
.sub-nav a.router-link-active {
  background-color: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.content {
  flex: 1;
  padding: 1.5rem;
}
</style>