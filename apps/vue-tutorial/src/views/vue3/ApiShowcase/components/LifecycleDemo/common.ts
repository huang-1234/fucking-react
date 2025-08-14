// 代码示例
export const optionsApiCode = `// Options API 生命周期钩子
export default {
  beforeCreate() {
    console.log('beforeCreate')
  },
  created() {
    console.log('created')
  },
  beforeMount() {
    console.log('beforeMount')
  },
  mounted() {
    console.log('mounted')
  },
  beforeUpdate() {
    console.log('beforeUpdate')
  },
  updated() {
    console.log('updated')
  },
  beforeUnmount() { // Vue 3 中改名 (Vue 2 是 beforeDestroy)
    console.log('beforeUnmount')
  },
  unmounted() { // Vue 3 中改名 (Vue 2 是 destroyed)
    console.log('unmounted')
  }
}`

export const compositionApiCode = `// Composition API 生命周期钩子
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted
} from 'vue'

// setup 函数自身相当于 beforeCreate 和 created
export default {
  setup() {
    // 注册生命周期钩子
    onBeforeMount(() => {
      console.log('onBeforeMount')
    })

    onMounted(() => {
      console.log('onMounted')
    })

    onBeforeUpdate(() => {
      console.log('onBeforeUpdate')
    })

    onUpdated(() => {
      console.log('onUpdated')
    })

    onBeforeUnmount(() => {
      console.log('onBeforeUnmount')
    })

    onUnmounted(() => {
      console.log('onUnmounted')
    })
  }
}`

export const scriptSetupCode = `// <script setup> 中的生命周期钩子
<script setup>
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted
} from 'vue'

// 直接在顶层调用生命周期钩子
onBeforeMount(() => {
  console.log('onBeforeMount')
})

onMounted(() => {
  console.log('onMounted')
})

// 其他钩子...
</script>`
