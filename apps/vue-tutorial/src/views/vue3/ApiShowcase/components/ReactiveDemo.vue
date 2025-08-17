<script setup lang="ts">
import { ref } from 'vue'
import SimpleCodeEditor from '../../../../components/SimpleCodeEditor.vue'
import { useReactiveDemo } from '../ApiShowcase'

// 使用响应式API
const { count, state, doubleCount, fullName, increment, addFeature, updateFullName } = useReactiveDemo()

// 用于添加新特性的输入
const newFeature = ref('')

// 添加特性
const handleAddFeature = () => {
  if (newFeature.value) {
    addFeature(newFeature.value)
    newFeature.value = ''
  }
}

// 更新全名
const newFullName = ref(fullName.value)
const handleUpdateFullName = () => {
  updateFullName(newFullName.value)
}

// 代码示例
const refCode = `// ref - 基础类型响应式
const count = ref(0)

// 访问和修改值
console.log(count.value) // 0
count.value++
console.log(count.value) // 1

// 在模板中自动解包
<div>{{ count }}</div> // 不需要 .value`

const reactiveCode = `// reactive - 对象响应式
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

const computedCode = `// computed - 计算属性
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
</script>

<template>
  <div class="reactive-demo">
    <div class="demo-section">
      <h3>响应式 API</h3>
      <p>Vue 3 提供了多种创建响应式数据的方式</p>

      <div class="reactive-examples">
        <div class="example-card">
          <h4>ref 示例</h4>
          <div class="example-content">
            <p>计数器: {{ count }}</p>
            <p>双倍值: {{ doubleCount }}</p>
            <button @click="increment">增加</button>
          </div>
        </div>

        <div class="example-card">
          <h4>reactive 示例</h4>
          <div class="example-content">
            <p>名称: {{ state.name }}</p>
            <p>版本: {{ state.version }}</p>
            <div class="features">
              <p>特性:</p>
              <ul>
                <li v-for="(feature, index) in state.features" :key="index">
                  {{ feature }}
                </li>
              </ul>
            </div>
            <div class="form-group">
              <input v-model="newFeature" placeholder="添加新特性" />
              <button @click="handleAddFeature">添加</button>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>computed 示例</h4>
          <div class="example-content">
            <p>当前全名: {{ fullName }}</p>
            <div class="form-group">
              <input v-model="newFullName" placeholder="更新全名" />
              <button @click="handleUpdateFullName">更新</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>ref</h5>
          <SimpleCodeEditor :code="refCode" language="javascript" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>reactive</h5>
          <SimpleCodeEditor :code="reactiveCode" language="javascript" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>computed</h5>
          <SimpleCodeEditor :code="computedCode" language="javascript" :readOnly="true" height="200px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reactive-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.reactive-examples {
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

.features {
  margin-top: 12px;
}

.features ul {
  margin-top: 8px;
  padding-left: 20px;
}

.form-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  flex-grow: 1;
}

button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color-hover);
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

@media (max-width: 768px) {
  .reactive-examples, .code-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
