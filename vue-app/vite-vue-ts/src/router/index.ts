import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/vue3',
    name: 'Vue3',
    component: () => import('../layouts/Vue3Layout.vue'),
    children: [
      {
        path: 'composition-api',
        name: 'CompositionAPI',
        component: () => import('../views/vue3/CompositionAPI.vue')
      },
      {
        path: 'reactive-system',
        name: 'ReactiveSystem',
        component: () => import('../views/vue3/ReactiveSystem.vue')
      },
      {
        path: 'lifecycle-hooks',
        name: 'LifecycleHooks',
        component: () => import('../views/vue3/LifecycleHooks.vue')
      },
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('../views/vue3/Performance.vue')
      }
    ]
  },
  {
    path: '/api-compare',
    name: 'APICompare',
    component: () => import('../views/APICompare.vue')
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/Playground.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router