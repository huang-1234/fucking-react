// 代码示例
export const transitionCode = `<Transition name="fade">
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

export const keepAliveCode = `<KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
  <component :is="currentComponent"></component>
</KeepAlive>`

export const teleportCode = `<!-- 将内容传送到 body 元素下 -->
<Teleport to="body">
  <div class="modal">
    <h3>这是一个模态框</h3>
    <p>模态框内容...</p>
    <button @click="closeModal">关闭</button>
  </div>
</Teleport>`

export const suspenseCode = `<Suspense>
  <!-- 异步组件内容 -->
  <template #default>
    <AsyncComponent />
  </template>

  <!-- 加载状态 -->
  <template #fallback>
    <div>加载中...</div>
  </template>
</Suspense>`
