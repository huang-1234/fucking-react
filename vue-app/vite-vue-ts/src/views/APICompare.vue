<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from '../components/CodeEditor.vue'

// 示例代码对比
const examples = [
  {
    title: '组件基本结构',
    vue2: `<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>`,
    vue3: `<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value++
}
</script>`
  },
  {
    title: '计算属性',
    vue2: `<template>
  <div>
    <p>Original: {{ message }}</p>
    <p>Reversed: {{ reversedMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue'
    }
  },
  computed: {
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  }
}
</script>`,
    vue3: `<template>
  <div>
    <p>Original: {{ message }}</p>
    <p>Reversed: {{ reversedMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const message = ref('Hello Vue')
const reversedMessage = computed(() => {
  return message.value.split('').reverse().join('')
})
</script>`
  },
  {
    title: '侦听器',
    vue2: `<template>
  <div>
    <input v-model="query">
    <p>Results: {{ results }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      results: ''
    }
  },
  watch: {
    query(newValue, oldValue) {
      this.getResults(newValue)
    }
  },
  methods: {
    getResults(query) {
      // 模拟API调用
      this.results = \`Results for \${query}\`
    }
  }
}
</script>`,
    vue3: `<template>
  <div>
    <input v-model="query">
    <p>Results: {{ results }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const query = ref('')
const results = ref('')

watch(query, (newValue, oldValue) => {
  getResults(newValue)
})

function getResults(query) {
  // 模拟API调用
  results.value = \`Results for \${query}\`
}
</script>`
  },
  {
    title: '生命周期钩子',
    vue2: `<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
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
  beforeDestroy() {
    console.log('beforeDestroy')
  },
  destroyed() {
    console.log('destroyed')
  }
}
</script>`,
    vue3: `<template>
  <div>{{ message }}</div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate,
  onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

const message = ref('Hello')

// 没有beforeCreate和created，setup本身就是在这些钩子之前执行
console.log('setup (replaces beforeCreate/created)')

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
  console.log('onBeforeUnmount (was beforeDestroy)')
})

onUnmounted(() => {
  console.log('onUnmounted (was destroyed)')
})
</script>`
  },
  {
    title: '组件通信',
    vue2: `// 父组件
<template>
  <div>
    <child-component
      :message="parentMessage"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      parentMessage: 'Message from parent'
    }
  },
  methods: {
    handleUpdate(newValue) {
      console.log('Updated:', newValue)
    }
  }
}
</script>

// 子组件
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="sendUpdate">Send Update</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    sendUpdate() {
      this.$emit('update', 'New value')
    }
  }
}
</script>`,
    vue3: `// 父组件
<template>
  <div>
    <child-component
      :message="parentMessage"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const parentMessage = ref('Message from parent')

function handleUpdate(newValue) {
  console.log('Updated:', newValue)
}
</script>

// 子组件
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="sendUpdate">Send Update</button>
  </div>
</template>

<script setup>
// 使用defineProps和defineEmits宏函数
const props = defineProps({
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update'])

function sendUpdate() {
  emit('update', 'New value')
}
</script>`
  },
  {
    title: '逻辑复用',
    vue2: `// 使用Mixin
// counter-mixin.js
export const counterMixin = {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
}

// 组件中使用
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script>
import { counterMixin } from './counter-mixin'

export default {
  mixins: [counterMixin]
}
</script>`,
    vue3: `// 使用组合函数
// useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    increment,
    decrement
  }
}

// 组件中使用
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { useCounter } from './useCounter'

// 直接解构并使用
const { count, increment, decrement } = useCounter()
</script>`
  }
]

const currentExample = ref(0)

function nextExample() {
  currentExample.value = (currentExample.value + 1) % examples.length
}

function prevExample() {
  currentExample.value = (currentExample.value - 1 + examples.length) % examples.length
}
</script>

<template>
  <div class="api-compare">
    <h1>Vue2 vs Vue3 API 对比</h1>

    <div class="comparison-navigation">
      <button @click="prevExample" class="nav-button">&larr; 上一个</button>
      <span class="example-counter">{{ currentExample + 1 }} / {{ examples.length }}</span>
      <button @click="nextExample" class="nav-button">下一个 &rarr;</button>
    </div>

    <h2>{{ examples[currentExample].title }}</h2>

    <div class="comparison-container">
      <div class="comparison-side">
        <h3>Options API (Vue2)</h3>
        <div class="code-container">
          <CodeEditor
            :code="examples[currentExample].vue2"
            language="vue"
            :readOnly="true"
            height="500px"
          />
        </div>
      </div>

      <div class="comparison-divider">
        <div class="divider-line"></div>
        <div class="vs-badge">VS</div>
        <div class="divider-line"></div>
      </div>

      <div class="comparison-side">
        <h3>Composition API (Vue3)</h3>
        <div class="code-container">
          <CodeEditor
            :code="examples[currentExample].vue3"
            language="vue"
            :readOnly="true"
            height="500px"
          />
        </div>
      </div>
    </div>

    <div class="comparison-table">
      <h3>主要差异</h3>
      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>Options API (Vue2)</th>
            <th>Composition API (Vue3)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>数据定义</td>
            <td>data() 选项</td>
            <td>ref() / reactive()</td>
          </tr>
          <tr>
            <td>方法定义</td>
            <td>methods 选项</td>
            <td>普通函数</td>
          </tr>
          <tr>
            <td>计算属性</td>
            <td>computed 选项</td>
            <td>computed() 函数</td>
          </tr>
          <tr>
            <td>侦听器</td>
            <td>watch 选项</td>
            <td>watch() / watchEffect() 函数</td>
          </tr>
          <tr>
            <td>生命周期</td>
            <td>生命周期选项</td>
            <td>onXXX() 函数</td>
          </tr>
          <tr>
            <td>组件通信</td>
            <td>props / $emit</td>
            <td>defineProps / defineEmits</td>
          </tr>
          <tr>
            <td>逻辑复用</td>
            <td>Mixins (容易命名冲突)</td>
            <td>组合函数 (更清晰)</td>
          </tr>
          <tr>
            <td>TypeScript支持</td>
            <td>有限</td>
            <td>原生支持</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.api-compare {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.comparison-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #3ca576;
}

.example-counter {
  margin: 0 1rem;
  font-size: 1.1rem;
  color: var(--text-color);
}

.comparison-container {
  display: flex;
  margin-bottom: 3rem;
}

.comparison-side {
  flex: 1;
}

.comparison-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  margin-top: 3rem;
}

.divider-line {
  flex: 1;
  width: 1px;
  background-color: var(--border-color);
}

.vs-badge {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.code-container {
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table {
  margin-top: 3rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

tr:hover {
  background-color: rgba(66, 184, 131, 0.05);
}

@media (max-width: 900px) {
  .comparison-container {
    flex-direction: column;
  }

  .comparison-divider {
    flex-direction: row;
    padding: 1rem 0;
    margin: 1rem 0;
  }

  .divider-line {
    height: 1px;
    width: auto;
    flex: 1;
  }

  .vs-badge {
    margin: 0 1rem;
  }
}
</style>