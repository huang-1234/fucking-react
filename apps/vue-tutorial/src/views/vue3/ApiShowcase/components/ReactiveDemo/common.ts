// 代码示例
export const refCode = `// ref - 基础类型响应式
const count = ref(0)

// 访问和修改值
console.log(count.value) // 0
count.value++
console.log(count.value) // 1

// 在模板中自动解包
<div>{{ count }}</div> // 不需要 .value`

export const reactiveCode = `// reactive - 对象响应式
const state = reactive({
  name: 'Vue 3',
  version: '3.5.17',
  features: ['Composition API', 'Teleport', 'Fragments']
})

// 直接访问和修改属性
console.log(state.name) // 'Vue 3'
state.features.push('新特性')

// 在模板中使用
<div>{{ state.name }} {{ state.version }}</div>`

export const computedCode = `// computed - 计算属性
const doubleCount = computed(() => count.value * 2)

// 可写计算属性
const fullName = computed({
  get: () => \`\${state.name} \${state.version}\`,
  set: (newValue: string) => {
    const parts = newValue.split(' ')
    state.name = parts[0] || ''
    state.version = parts[1] || ''
  }
})`
