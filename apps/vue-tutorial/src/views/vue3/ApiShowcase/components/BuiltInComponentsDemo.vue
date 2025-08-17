<script setup lang="ts">
import { ref, shallowRef, defineAsyncComponent } from 'vue'
import SimpleCodeEditor from '../../../../components/SimpleCodeEditor.vue'

// 状态
const show = ref(true)
const currentTab = ref('home')

// 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  new Promise((resolve) => {
    // 模拟异步加载
    setTimeout(() => {
      resolve({
        template: '<div class="async-component">异步加载的组件</div>'
      })
    }, 1000)
  })
)

// 动态组件
const tabs = ['home', 'profile', 'settings']
const components = {
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

const currentComponent = shallowRef(components.home)

const switchTab = (tab: string) => {
  currentTab.value = tab
  currentComponent.value = components[tab as keyof typeof components]
}

// 代码示例
const transitionCode = `<Transition name="fade">
  <p v-if="show">Hello Vue 3!</p>
</Transition>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>`

const keepAliveCode = `<KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
  <component :is="currentComponent"></component>
</KeepAlive>`

const teleportCode = `<!-- 将内容传送到 body 元素下 -->
<Teleport to="body">
  <div class="modal">
    <h3>这是一个模态框</h3>
    <p>模态框内容...</p>
    <button @click="closeModal">关闭</button>
  </div>
</Teleport>`

const suspenseCode = `<Suspense>
  <!-- 异步组件内容 -->
  <template #default>
    <AsyncComponent />
  </template>

  <!-- 加载状态 -->
  <template #fallback>
    <div>加载中...</div>
  </template>
</Suspense>`
</script>

<template>
  <div class="built-in-components-demo">
    <div class="demo-section">
      <h3>内置组件</h3>
      <p>Vue 3 提供了多个内置组件，用于实现特定功能</p>

      <div class="component-examples">
        <div class="example-card">
          <h4>Transition</h4>
          <div class="example-content">
            <button @click="show = !show">
              {{ show ? '隐藏' : '显示' }}
            </button>
            <Transition name="fade">
              <p v-if="show" class="transition-demo">Hello Vue 3!</p>
            </Transition>
          </div>
        </div>

        <div class="example-card">
          <h4>KeepAlive & Component</h4>
          <div class="example-content">
            <div class="tabs">
              <button
                v-for="tab in tabs"
                :key="tab"
                :class="{ active: currentTab === tab }"
                @click="switchTab(tab)"
              >
                {{ tab }}
              </button>
            </div>
            <div class="tab-container">
              <KeepAlive>
                <component :is="currentComponent" />
              </KeepAlive>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>Suspense</h4>
          <div class="example-content">
            <Suspense>
              <template #default>
                <AsyncComponent />
              </template>
              <template #fallback>
                <div class="loading">加载中...</div>
              </template>
            </Suspense>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>Transition</h5>
          <SimpleCodeEditor :code="transitionCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>KeepAlive</h5>
          <SimpleCodeEditor :code="keepAliveCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>Teleport</h5>
          <SimpleCodeEditor :code="teleportCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>Suspense</h5>
          <SimpleCodeEditor :code="suspenseCode" language="vue" :readOnly="true" height="200px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.built-in-components-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.component-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.example-card {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--box-shadow);
}

.example-content {
  margin-top: 12px;
}

button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

button:hover {
  background-color: var(--primary-color-hover);
}

button.active {
  background-color: var(--primary-color-active);
}

.transition-demo {
  padding: 16px;
  background-color: var(--primary-color-light);
  border-radius: var(--border-radius-sm);
  margin-top: 12px;
}

.tabs {
  display: flex;
  margin-bottom: 12px;
}

.tab-container {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 16px;
  min-height: 100px;
}

.tab-content {
  padding: 8px 0;
}

.loading, .async-component {
  padding: 16px;
  text-align: center;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
}

.code-section {
  margin-top: 24px;
}

.code-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.code-tab {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
}

h5 {
  margin-bottom: 8px;
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .component-examples, .code-tabs {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-wrap: wrap;
  }
}
</style>
