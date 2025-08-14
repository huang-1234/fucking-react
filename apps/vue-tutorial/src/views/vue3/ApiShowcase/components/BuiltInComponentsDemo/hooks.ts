import { ref, shallowRef, defineAsyncComponent } from 'vue'

// 状态
export const show = ref(true)
export const currentTab = ref('home')

// 异步组件
export const AsyncComponent = defineAsyncComponent(() =>
  new Promise((resolve) => {
    // 模拟异步加载
    setTimeout(() => {
      resolve({
        // @ts-ignore - 简化示例，实际应该返回一个组件
        template: '<div class="async-component">异步加载的组件</div>'
      })
    }, 1000)
  })
)

// 动态组件
export const tabs = ['home', 'profile', 'settings']
export const components = {
  home: {
    template: '<div class="tab-content">首页内容</div>'
  },
  profile: {
    template: '<div class="tab-content">个人资料内容</div>'
  },
  settings: {
    template: '<div class="tab-content">设置内容</div>'
  }
}

export const currentComponent = shallowRef(components.home)

export const switchTab = (tab: string) => {
  currentTab.value = tab
  currentComponent.value = components[tab as keyof typeof components]
}
