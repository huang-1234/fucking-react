<script setup lang="ts">
import CodeEditor from '@/components/CodeEditor.vue'
import { usePerformance, useComparisonData } from './Performance'
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

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const {
  staticHoistingCode,
  patchFlagCode,
  cacheHandlersCode,
  performanceTips,
  improvements
} = usePerformance()

// 从Performance.ts导入比较数据
const { comparisonColumns, comparisonData } = useComparisonData()
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

      <Tabs default-active-key="1" class="feature-tabs">
        <TabPane key="1" tab="静态树提升">
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
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'improvement'">
              <Tag color="green">{{ text }}</Tag>
            </template>
          </template>
        </Table>
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
  height: 100%;
  border-radius: var(--border-radius-md);
}

.code-card {
  border-radius: var(--border-radius-md);
}

.tip-card {
  height: 100%;
  border-radius: var(--border-radius-md);
}

.comparison-card {
  border-radius: var(--border-radius-md);
}

:deep(.ant-typography) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.ant-statistic-title) {
  font-size: 16px;
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.ant-progress-text) {
  color: var(--primary-color) !important;
}

:deep(.ant-card-head) {
  min-height: 40px;
}

:deep(.ant-card-head-title) {
  padding: 8px 0;
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

  :deep(.ant-statistic-title) {
    font-size: 14px;
  }

  :deep(.ant-statistic-content) {
    font-size: 20px;
  }
}
</style>