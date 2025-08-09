import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/index.vue')
  },
  {
    path: '/vue3',
    name: 'Vue3',
    component: () => import('../layouts/Vue3Layout.vue'),
    children: [
      {
        path: 'composition-api',
        name: 'CompositionAPI',
        component: () => import('../views/vue3/CompositionAPI/index.vue')
      },
      {
        path: 'reactive-system',
        name: 'ReactiveSystem',
        component: () => import('../views/vue3/ReactiveSystem/index.vue')
      },
      {
        path: 'lifecycle-hooks',
        name: 'LifecycleHooks',
        component: () => import('../views/vue3/LifecycleHooks/index.vue')
      },
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('../views/vue3/Performance/index.vue')
      }
    ]
  },
  {
    path: '/api-compare',
    name: 'APICompare',
    component: () => import('../views/APICompare/index.vue')
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/Playground/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router