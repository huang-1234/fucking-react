import { ref } from "vue"

export const lifecycleCode = `<script setup>
import { ref, onMounted, onUpdated, onBeforeUnmount, onUnmounted,
  onBeforeMount, onErrorCaptured, onRenderTracked, onRenderTriggered } from 'vue'

// 在setup中直接编写初始化代码
// 相当于Vue2中的beforeCreate和created
const count = ref(0)
console.log('组件初始化')

// 挂载前
onBeforeMount(() => {
  console.log('组件即将挂载')
})

// 挂载后
onMounted(() => {
  console.log('组件已挂载')
  // 可以访问DOM，进行副作用操作
  // 如API请求、设置定时器等
})

// 更新前
onBeforeUpdate(() => {
  console.log('组件即将更新')
})

// 更新后
onUpdated(() => {
  console.log('组件已更新')
  // 可以访问更新后的DOM
})

// 卸载前
onBeforeUnmount(() => {
  console.log('组件即将卸载')
  // 清理副作用，如定时器、事件监听器等
})

// 卸载后
onUnmounted(() => {
  console.log('组件已卸载')
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.log('捕获到后代组件错误', err)
  // 返回false阻止错误继续传播
  return false
})

// 调试钩子 - 仅在开发模式有效
onRenderTracked((e) => {
  console.log('渲染依赖被跟踪', e)
})

onRenderTriggered((e) => {
  console.log('触发渲染的依赖', e)
})
</script>`


export const refLifecycleCode = ref(lifecycleCode)

export const useLifecycleCode = () => {
  return {
    lifecycleCode
  }
}