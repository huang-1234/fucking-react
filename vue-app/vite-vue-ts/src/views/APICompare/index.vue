<script setup lang="ts">
import CodeEditor from '@/components/CodeEditor.vue'
import { useAPICompare } from './APICompare'
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
  Badge,
  Steps,
  Carousel
} from 'ant-design-vue'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps
const { examples, currentExample, nextExample, prevExample } = useAPICompare()

// 差异表格数据
const differenceColumns = [
  {
    title: '特性',
    dataIndex: 'feature',
    key: 'feature',
    width: '25%',
  },
  {
    title: 'Options API (Vue2)',
    dataIndex: 'options',
    key: 'options',
    width: '37.5%',
  },
  {
    title: 'Composition API (Vue3)',
    dataIndex: 'composition',
    key: 'composition',
    width: '37.5%',
  },
]

const differenceData = [
  {
    key: '1',
    feature: '数据定义',
    options: 'data() 选项',
    composition: 'ref() / reactive()',
  },
  {
    key: '2',
    feature: '方法定义',
    options: 'methods 选项',
    composition: '普通函数',
  },
  {
    key: '3',
    feature: '计算属性',
    options: 'computed 选项',
    composition: 'computed() 函数',
  },
  {
    key: '4',
    feature: '侦听器',
    options: 'watch 选项',
    composition: 'watch() / watchEffect() 函数',
  },
  {
    key: '5',
    feature: '生命周期',
    options: '生命周期选项',
    composition: 'onXXX() 函数',
  },
  {
    key: '6',
    feature: '组件通信',
    options: 'props / $emit',
    composition: 'defineProps / defineEmits',
  },
  {
    key: '7',
    feature: '逻辑复用',
    options: 'Mixins (容易命名冲突)',
    composition: '组合函数 (更清晰)',
  },
  {
    key: '8',
    feature: 'TypeScript支持',
    options: '有限',
    composition: '原生支持',
  },
]
</script>

<template>
  <div class="api-compare">
    <Typography>
      <Title :level="2">Vue2 vs Vue3 API 对比</Title>
      <Paragraph>
        Vue3引入了Composition API，与Vue2的Options API相比有很多不同。通过以下示例可以了解两者的差异。
      </Paragraph>
    </Typography>

    <Divider />

    <section class="example-section">
      <Card class="navigation-card">
        <Steps :current="currentExample" size="small" class="example-steps">
          <Step v-for="(example, index) in examples" :key="index" :title="example.title" />
        </Steps>

        <Space class="navigation-buttons">
          <Button
            type="primary"
            @click="prevExample"
            shape="circle"
            icon="left"
          >
            &larr;
          </Button>
          <Text strong>{{ currentExample + 1 }} / {{ examples.length }}</Text>
          <Button
            type="primary"
            @click="nextExample"
            shape="circle"
            icon="right"
          >
            &rarr;
          </Button>
        </Space>
      </Card>

      <Title :level="3" class="example-title">
        {{ examples[currentExample].title }}
      </Title>

      <Row :gutter="[16, 16]">
        <Col :xs="24" :md="11">
          <Card title="Options API (Vue2)" class="code-card">
            <Badge.Ribbon text="Vue2" color="#41B883">
              <CodeEditor
                :code="examples[currentExample].vue2"
                language="vue"
                :readOnly="true"
                height="500px"
              />
            </Badge.Ribbon>
          </Card>
        </Col>

        <Col :xs="24" :md="2">
          <div class="comparison-divider">
            <div class="divider-line"></div>
            <div class="vs-badge">VS</div>
            <div class="divider-line"></div>
          </div>
        </Col>

        <Col :xs="24" :md="11">
          <Card title="Composition API (Vue3)" class="code-card">
            <Badge.Ribbon text="Vue3" color="#41B883">
              <CodeEditor
                :code="examples[currentExample].vue3"
                language="vue"
                :readOnly="true"
                height="500px"
              />
            </Badge.Ribbon>
          </Card>
        </Col>
      </Row>
    </section>

    <Divider />

    <section class="difference-section">
      <Typography>
        <Title :level="3">主要差异</Title>
      </Typography>

      <Card class="table-card">
        <Table
          :columns="differenceColumns"
          :dataSource="differenceData"
          :pagination="false"
          :bordered="true"
          size="middle"
        />
      </Card>
    </section>
  </div>
</template>

<style scoped>
.api-compare {
  width: 100%;
}

.example-section {
  margin-bottom: 24px;
}

.navigation-card {
  margin-bottom: 24px;
  border-radius: var(--border-radius-md);
}

.example-steps {
  margin-bottom: 16px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.example-title {
  text-align: center;
  margin-bottom: 24px !important;
}

.code-card {
  height: 100%;
  border-radius: var(--border-radius-md);
}

.comparison-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.divider-line {
  flex: 1;
  width: 1px;
  background-color: var(--border-color);
}

.vs-badge {
  margin: 16px 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.difference-section {
  margin-bottom: 24px;
}

.table-card {
  border-radius: var(--border-radius-md);
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

:deep(.ant-steps-item-title) {
  font-size: 12px;
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ant-table) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--primary-color-light);
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.ant-card-body) {
    padding: 12px;
  }

  .comparison-divider {
    flex-direction: row;
    height: auto;
    margin: 16px 0;
  }

  .divider-line {
    height: 1px;
    width: auto;
    flex: 1;
  }

  .vs-badge {
    margin: 0 8px;
  }

  :deep(.ant-steps-horizontal) {
    flex-direction: column;
  }

  :deep(.ant-steps-item) {
    margin-right: 0 !important;
    padding-right: 0 !important;
  }

  :deep(.ant-steps-item-title) {
    width: auto;
  }
}
</style>