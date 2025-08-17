<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import SimpleCodeEditor from '../../../../components/SimpleCodeEditor.vue'
import { useLifecycleDemo } from '../ApiShowcase'

// 使用生命周期钩子示例
const { logs, addLog } = useLifecycleDemo()

// 触发更新的计数器
const updateCounter = ref(0)

// 在各个生命周期钩子中添加日志
onBeforeMount(() => {
  addLog('onBeforeMount: 组件挂载前')
})

onMounted(() => {
  addLog('onMounted: 组件挂载后')
})

onBeforeUpdate(() => {
  addLog('onBeforeUpdate: 组件更新前')
})

onUpdated(() => {
  addLog('onUpdated: 组件更新后')
})

onBeforeUnmount(() => {
  addLog('onBeforeUnmount: 组件卸载前')
})

onUnmounted(() => {
  addLog('onUnmounted: 组件卸载后')
})

// 触发组件更新
const triggerUpdate = () => {
  updateCounter.value++
  addLog(`手动触发更新: ${updateCounter.value}`)
}

// 代码示例
const optionsApiCode = `// Options API 生命周期钩子
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

const compositionApiCode = `// Composition API 生命周期钩子
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

const scriptSetupCode = `// <script setup> 中的生命周期钩子
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
</script>

<template>
  <div class="lifecycle-demo">
    <div class="demo-section">
      <h3>生命周期钩子</h3>
      <p>Vue 3 提供了一系列生命周期钩子，用于在组件生命周期的不同阶段执行代码</p>

      <div class="lifecycle-examples">
        <div class="example-card">
          <h4>生命周期日志</h4>
          <div class="example-content">
            <div class="logs-container">
              <div v-for="(log, index) in logs" :key="index" class="log-entry">
                {{ log }}
              </div>
            </div>
            <div class="actions">
              <button @click="triggerUpdate">触发更新</button>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>计数器: {{ updateCounter }}</h4>
          <div class="lifecycle-diagram">
            <div class="lifecycle-phase">创建阶段</div>
            <div class="lifecycle-hook">beforeCreate</div>
            <div class="lifecycle-hook">created</div>
            <div class="lifecycle-phase">挂载阶段</div>
            <div class="lifecycle-hook">beforeMount</div>
            <div class="lifecycle-hook">mounted</div>
            <div class="lifecycle-phase">更新阶段</div>
            <div class="lifecycle-hook">beforeUpdate</div>
            <div class="lifecycle-hook">updated</div>
            <div class="lifecycle-phase">卸载阶段</div>
            <div class="lifecycle-hook">beforeUnmount</div>
            <div class="lifecycle-hook">unmounted</div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>Options API</h5>
          <SimpleCodeEditor :code="optionsApiCode" language="javascript" :readOnly="true" height="300px" />
        </div>

        <div class="code-tab">
          <h5>Composition API</h5>
          <SimpleCodeEditor :code="compositionApiCode" language="javascript" :readOnly="true" height="300px" />
        </div>

        <div class="code-tab">
          <h5>Script Setup</h5>
          <SimpleCodeEditor :code="scriptSetupCode" language="javascript" :readOnly="true" height="300px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lifecycle-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.lifecycle-examples {
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

.logs-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px;
  background-color: var(--bg-color);
  margin-bottom: 12px;
}

.log-entry {
  padding: 4px 0;
  border-bottom: 1px dashed var(--border-color);
  font-family: monospace;
  font-size: 14px;
}

.log-entry:last-child {
  border-bottom: none;
}

.actions {
  display: flex;
  justify-content: center;
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

.lifecycle-diagram {
  margin-top: 12px;
}

.lifecycle-phase {
  background-color: var(--primary-color);
  color: white;
  padding: 8px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 8px;
  text-align: center;
  font-weight: bold;
}

.lifecycle-hook {
  background-color: var(--primary-color-light);
  color: var(--text-color);
  padding: 6px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 6px;
  text-align: center;
  font-family: monospace;
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
  .lifecycle-examples, .code-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
