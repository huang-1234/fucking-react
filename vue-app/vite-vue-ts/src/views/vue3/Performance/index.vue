<script setup lang="ts">
import CodeEditor from '@/components/CodeEditor.vue'
import { usePerformance } from './Performance'
import {
  Typography,
  Card,
  Divider,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Tag,
  Progress,
  List
} from 'ant-design-vue'

const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs

const {
  staticHoistingCode,
  patchFlagCode,
  cacheHandlersCode,
  performanceTips,
  performanceData,
  improvements
} = usePerformance()

// 性能对比表格数据
const comparisonColumns = [
  {
    title: '性能指标',
    dataIndex: 'metric',
    key: 'metric',
    width: '25%',
  },
  {
    title: 'Vue2',
    dataIndex: 'vue2',
    key: 'vue2',
    width: '25%',
  },
  {
    title: 'Vue3',
    dataIndex: 'vue3',
    key: 'vue3',
    width: '25%',
  },
  {
    title: '提升',
    dataIndex: 'improvement',
    key: 'improvement',
    width: '25%',
  },
]

const comparisonData = [
  {
    key: '1',
    metric: '初始渲染时间',
    vue2: `${performanceData.vue2.renderTime}ms`,
    vue3: `${performanceData.vue3.renderTime}ms`,
    improvement: <Tag color="green">{improvements.renderTime}%</Tag>,
  },
  {
    key: '2',
    metric: '内存占用',
    vue2: `${performanceData.vue2.memoryUsage}MB`,
    vue3: `${performanceData.vue3.memoryUsage}MB`,
    improvement: <Tag color="green">{improvements.memoryUsage}%</Tag>,
  },
  {
    key: '3',
    metric: '更新性能',
    vue2: `${performanceData.vue2.updateTime}ms`,
    vue3: `${performanceData.vue3.updateTime}ms`,
    improvement: <Tag color="green">{improvements.updateTime}%</Tag>,
  },
  {
    key: '4',
    metric: 'Tree-Shaking支持',
    vue2: '有限',
    vue3: '完全支持',
    improvement: <Tag color="green">更小的包体积</Tag>,
  },
  {
    key: '5',
    metric: 'SSR性能',
    vue2: '中等',
    vue3: '显著提升',
    improvement: <Tag color="green">~2-3倍</Tag>,
  },
]
</script>

<template>
  <div class="performance">
    <Typography>
      <Title :level="2">Vue3 性能优化</Title>
      <Paragraph>
        Vue3通过编译优化和运行时优化，显著提升了框架性能，以下是Vue3的主要性能优化特性。
      </Paragraph>
    </Typography>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">1. 性能提升概览</Title>
      </Typography>

      <Row :gutter="[16, 16]">
        <Col :xs="24" :sm="8">
          <Card class="stat-card">
            <Statistic
              title="渲染速度提升"
              :value="improvements.renderTime"
              suffix="%"
              :value-style="{ color: '#42b883' }"
            >
              <template #prefix>
                <Progress type="dashboard" :percent="improvements.renderTime" size="small" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="8">
          <Card class="stat-card">
            <Statistic
              title="内存占用减少"
              :value="improvements.memoryUsage"
              suffix="%"
              :value-style="{ color: '#42b883' }"
            >
              <template #prefix>
                <Progress type="dashboard" :percent="improvements.memoryUsage" size="small" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="8">
          <Card class="stat-card">
            <Statistic
              title="更新性能提升"
              :value="improvements.updateTime"
              suffix="%"
              :value-style="{ color: '#42b883' }"
            >
              <template #prefix>
                <Progress type="dashboard" :percent="improvements.updateTime" size="small" />
              </template>
            </Statistic>
          </Card>
        </Col>
      </Row>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">2. 编译优化</Title>
      </Typography>

      <Tabs type="card">
        <TabPane key="1" tab="静态树提升 (Static Hoisting)">
          <Card class="code-card">
            <Paragraph>
              静态内容只会被创建一次，并在每次渲染时重用，减少内存占用和提高渲染性能。
            </Paragraph>
            <CodeEditor
              :code="staticHoistingCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </Card>
        </TabPane>

        <TabPane key="2" tab="Patch Flag (动态节点标记)">
          <Card class="code-card">
            <Paragraph>
              编译时标记动态内容的类型，运行时只需要关注有标记的内容，大幅提高更新性能。
            </Paragraph>
            <CodeEditor
              :code="patchFlagCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </Card>
        </TabPane>

        <TabPane key="3" tab="事件处理函数缓存">
          <Card class="code-card">
            <Paragraph>
              缓存事件处理函数，避免组件重新渲染时创建新的函数引用。
            </Paragraph>
            <CodeEditor
              :code="cacheHandlersCode"
              language="javascript"
              :readOnly="true"
              height="300px"
            />
          </Card>
        </TabPane>
      </Tabs>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">3. 性能优化最佳实践</Title>
      </Typography>

      <List
        :grid="{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }"
        :dataSource="performanceTips"
        :bordered="false"
      >
        <template #renderItem="{ item }">
          <List.Item>
            <Card :title="item.title" class="tip-card">
              <CodeEditor
                :code="item.code"
                language="javascript"
                :readOnly="true"
                height="150px"
              />
              <Paragraph style="margin-top: 16px">
                {{ item.description }}
              </Paragraph>
            </Card>
          </List.Item>
        </template>
      </List>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">4. Vue3 vs Vue2 性能对比</Title>
      </Typography>

      <Card class="comparison-card">
        <Table
          :columns="comparisonColumns"
          :dataSource="comparisonData"
          :pagination="false"
          :bordered="true"
          size="middle"
        />
      </Card>
    </section>
  </div>
</template>

<style scoped>
.performance {
  width: 100%;
}

.example-section {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: var(--border-radius-md);
  height: 100%;
}

.code-card {
  border-radius: var(--border-radius-md);
  margin-top: 16px;
}

.tip-card {
  border-radius: var(--border-radius-md);
  height: 100%;
}

.comparison-card {
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

:deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab) {
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
}

:deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active) {
  border-bottom-color: #fff;
}

:deep(.ant-statistic-title) {
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
}

:deep(.ant-progress-text) {
  color: var(--primary-color) !important;
}

:deep(.ant-table) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--primary-color-light);
}

:deep(.ant-list-item) {
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.ant-card-body) {
    padding: 12px;
  }

  :deep(.ant-tabs-tab) {
    padding: 8px 12px;
  }
}
</style>