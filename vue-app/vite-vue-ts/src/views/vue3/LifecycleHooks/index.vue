<script setup lang="ts">
import { ref, onMounted, onUpdated, onBeforeUnmount, onUnmounted, onBeforeMount } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import { useLifecycleCode } from './LifecycleHooks'
import {
  Typography,
  Card,
  Button,
  Divider,
  Space,
  Table,
  Row,
  Col,
  Tag,
  Timeline,
  Alert,
  Statistic,
  Badge
} from 'ant-design-vue'

const { Title, Paragraph, Text } = Typography

// 生命周期演示
const count = ref(0)
const logs = ref<string[]>([])
const currentTime = ref('')

const { lifecycleCode } = useLifecycleCode()

// 添加日志
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`${timestamp}: ${message}`)
}

// 更新当前时间
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

// 模拟组件生命周期
onBeforeMount(() => {
  addLog('onBeforeMount 触发: 组件即将挂载')
})

onMounted(() => {
  addLog('onMounted 触发: 组件已挂载')
  // 启动时间更新定时器
  const timer = setInterval(updateTime, 1000)

  // 在组件卸载前清除定时器
  onBeforeUnmount(() => {
    clearInterval(timer)
    addLog('清除了定时器')
  })
})

onUpdated(() => {
  addLog(`onUpdated 触发: 组件已更新，当前计数: ${count.value}`)
})

onBeforeUnmount(() => {
  addLog('onBeforeUnmount 触发: 组件即将卸载')
})

onUnmounted(() => {
  addLog('onUnmounted 触发: 组件已卸载')
})

// Vue2与Vue3生命周期对比
const lifecycleComparisonColumns = [
  {
    title: 'Vue2 Options API',
    dataIndex: 'vue2',
    key: 'vue2',
    width: '25%',
  },
  {
    title: 'Vue3 Composition API',
    dataIndex: 'vue3',
    key: 'vue3',
    width: '25%',
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description',
    width: '50%',
  },
]

const lifecycleComparisonData = [
  {
    key: '1',
    vue2: 'beforeCreate',
    vue3: 'setup()',
    description: 'setup函数在beforeCreate之前执行',
  },
  {
    key: '2',
    vue2: 'created',
    vue3: 'setup()',
    description: 'setup函数包含了created的功能',
  },
  {
    key: '3',
    vue2: 'beforeMount',
    vue3: 'onBeforeMount',
    description: '功能相同，使用方式不同',
  },
  {
    key: '4',
    vue2: 'mounted',
    vue3: 'onMounted',
    description: '功能相同，使用方式不同',
  },
  {
    key: '5',
    vue2: 'beforeUpdate',
    vue3: 'onBeforeUpdate',
    description: '功能相同，使用方式不同',
  },
  {
    key: '6',
    vue2: 'updated',
    vue3: 'onUpdated',
    description: '功能相同，使用方式不同',
  },
  {
    key: '7',
    vue2: 'beforeDestroy',
    vue3: 'onBeforeUnmount',
    description: '名称变更，功能相同',
  },
  {
    key: '8',
    vue2: 'destroyed',
    vue3: 'onUnmounted',
    description: '名称变更，功能相同',
  },
  {
    key: '9',
    vue2: 'errorCaptured',
    vue3: 'onErrorCaptured',
    description: '功能相同，使用方式不同',
  },
  {
    key: '10',
    vue2: '无',
    vue3: 'onRenderTracked',
    description: 'Vue3新增的调试钩子',
  },
  {
    key: '11',
    vue2: '无',
    vue3: 'onRenderTriggered',
    description: 'Vue3新增的调试钩子',
  },
]

// 生命周期最佳实践代码示例
const resourceFetchingCode = `onMounted(async () => {
  const data = await fetchData()
  results.value = data
})`

const cleanupCode = `onMounted(() => {
  const timer = setInterval(() => {
    // 定时操作
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer) // 清理定时器
  })
})`

const composableCode = `export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}`
</script>

<template>
  <div class="lifecycle-hooks">
    <Typography>
      <Title :level="2">Vue3 生命周期钩子</Title>
      <Paragraph>
        生命周期钩子允许你在组件的不同阶段执行代码，Vue3的Composition API提供了一套全新的生命周期钩子函数。
      </Paragraph>
    </Typography>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">1. 生命周期演示</Title>
      </Typography>

      <Card class="example-card">
        <Row :gutter="[16, 16]">
          <Col :xs="24" :md="12">
            <Card title="交互式演示" size="small" class="demo-card">
              <Space direction="vertical" style="width: 100%">
                <Statistic
                  title="当前时间"
                  :value="currentTime"
                  :value-style="{ color: '#42b883' }"
                />

                <Statistic
                  title="计数器"
                  :value="count"
                  :precision="0"
                />

                <Space>
                  <Button type="primary" @click="count++">增加计数</Button>
                  <Button @click="count = 0">重置</Button>
                </Space>

                <Alert
                  message="尝试点击按钮，观察右侧生命周期日志"
                  type="info"
                  showIcon
                />
              </Space>
            </Card>
          </Col>

          <Col :xs="24" :md="12">
            <Card title="生命周期日志" size="small" class="demo-card">
              <div class="logs-container">
                <Timeline>
                  <Timeline.Item
                    v-for="(log, index) in logs"
                    :key="index"
                    :color="log.includes('onMounted') ? 'green' :
                            log.includes('onUpdated') ? 'blue' :
                            log.includes('onBeforeUnmount') ? 'orange' :
                            log.includes('onUnmounted') ? 'red' : 'gray'"
                  >
                    <Text code>{{ log }}</Text>
                  </Timeline.Item>
                  <Timeline.Item v-if="logs.length === 0" color="gray">
                    <Text type="secondary">等待生命周期事件...</Text>
                  </Timeline.Item>
                </Timeline>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">2. 生命周期钩子函数</Title>
      </Typography>

      <Card class="example-card">
        <CodeEditor
          :code="lifecycleCode"
          language="vue"
          :readOnly="true"
          height="400px"
        />
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">3. Vue2 与 Vue3 生命周期对比</Title>
      </Typography>

      <Card class="example-card">
        <Table
          :columns="lifecycleComparisonColumns"
          :dataSource="lifecycleComparisonData"
          :pagination="false"
          :bordered="true"
          size="middle"
        />
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">4. 生命周期最佳实践</Title>
      </Typography>

      <Row :gutter="[16, 16]">
        <Col :xs="24" :lg="8">
          <Card title="资源获取" class="practice-card">
            <Paragraph>
              在<Text code>onMounted</Text>中进行API请求、DOM操作等
            </Paragraph>
            <CodeEditor
              :code="resourceFetchingCode"
              language="javascript"
              :readOnly="true"
              height="120px"
            />
          </Card>
        </Col>

        <Col :xs="24" :lg="8">
          <Card title="清理副作用" class="practice-card">
            <Paragraph>
              在<Text code>onBeforeUnmount</Text>中清理定时器、事件监听器等
            </Paragraph>
            <CodeEditor
              :code="cleanupCode"
              language="javascript"
              :readOnly="true"
              height="180px"
            />
          </Card>
        </Col>

        <Col :xs="24" :lg="8">
          <Card title="组合式函数中使用" class="practice-card">
            <Paragraph>
              在自定义组合函数中使用生命周期钩子
            </Paragraph>
            <CodeEditor
              :code="composableCode"
              language="javascript"
              :readOnly="true"
              height="240px"
            />
          </Card>
        </Col>
      </Row>
    </section>
  </div>
</template>

<style scoped>
.lifecycle-hooks {
  width: 100%;
}

.example-section {
  margin-bottom: 24px;
}

.example-card {
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.demo-card {
  height: 100%;
  border-radius: var(--border-radius-sm);
}

.logs-container {
  height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.practice-card {
  height: 100%;
  border-radius: var(--border-radius-sm);
}

:deep(.ant-typography) {
  margin-bottom: 0;
}

:deep(.ant-card-head) {
  min-height: 40px;
}

:deep(.ant-card-head-title) {
  padding: 8px 0;
}

:deep(.ant-statistic-title) {
  margin-bottom: 4px;
}

:deep(.ant-statistic-content) {
  font-size: 20px;
}

:deep(.ant-timeline-item-tail) {
  border-left-style: dashed;
}

:deep(.ant-table) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--primary-color-light);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .example-card {
    border-radius: var(--border-radius-sm);
  }

  :deep(.ant-card-body) {
    padding: 12px;
  }

  .logs-container {
    height: 200px;
  }
}
</style>