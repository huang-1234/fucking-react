// 代码示例
export const watchCode = `// 监听单一源
const searchQuery = ref('')
const searchResults = ref([])

watch(searchQuery, (newVal, oldVal) => {
  // 当 searchQuery 变化时执行
  searchResults.value = [\`搜索结果: \${newVal}\`]
})

// 监听多个源
watch(
  [() => user.name, () => user.age],
  ([newName, newAge], [oldName, oldAge]) => {
    searchResults.value.push(
      \`用户信息更新: \${newName}, \${newAge}岁\`
    )
  }
)`

export const watchEffectCode = `// watchEffect (自动依赖收集)
watchEffect(() => {
  // 自动追踪 searchQuery 和 user.name 的变化
  searchResults.value.push(
    \`当前查询: \${searchQuery.value}, 用户: \${user.name}\`
  )
}, {
  flush: 'post' // 在DOM更新后调用
})`

export const watchOptionsCode = `// watch 选项
watch(source, callback, {
  immediate: true, // 立即执行一次
  deep: true,      // 深度监听对象内部变化
  flush: 'pre',    // 'pre' | 'post' | 'sync'
  onTrack(e) {     // 调试钩子
    console.log('被追踪', e)
  },
  onTrigger(e) {   // 调试钩子
    console.log('被触发', e)
  }
})`
