

// 代码示例
const globalDirectiveCode = `// 全局注册指令
// main.ts
app.directive('focus', {
  mounted: (el) => {
    el.focus()
  }
})

// 使用
<input v-focus />`

const localDirectiveCode = `// 局部注册指令
// 组件中
export default {
  directives: {
    highlight: {
      beforeMount: (el, binding) => {
        el.style.backgroundColor = binding.value || 'yellow'
      }
    }
  }
}

// 使用
<div v-highlight="'#ffeb3b'">高亮文本</div>`

const directiveHooksCode = `// 指令钩子函数
const myDirective = {
  // 在绑定元素的 attribute 前或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {},

  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件及自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},

  // 在更新包含组件的 VNode 之前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 在包含组件的 VNode 及其子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
}`

const scriptSetupDirectiveCode = `<script setup>
// <script setup> 中使用自定义指令
// 导入指令
import { vFocus } from './directives';

// 定义局部指令
const vHighlight = {
  mounted: (el, binding) => {
    el.style.backgroundColor = binding.value || 'yellow'
  }
}
</script>

<template>
  <!-- 使用指令 -->
  <input v-focus />
  <div v-highlight="'#ffeb3b'">高亮文本</div>
</template>`


export {
  globalDirectiveCode,
  localDirectiveCode,
  directiveHooksCode,
  scriptSetupDirectiveCode
}