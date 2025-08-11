import { ref } from 'vue'

// 示例代码对比
export const examples = [
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

// 当前示例索引
export const currentExample = ref(0)

// 导航函数
export function nextExample() {
  currentExample.value = (currentExample.value + 1) % examples.length
}

export function prevExample() {
  currentExample.value = (currentExample.value - 1 + examples.length) % examples.length
}

// 导出组合函数
export function useAPICompare() {
  return {
    examples,
    currentExample,
    nextExample,
    prevExample
  }
}