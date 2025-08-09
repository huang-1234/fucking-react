<script setup lang="ts">
import { useReactiveSystem, useStaticData } from './ReactiveSystem'
import {
  Typography,
  Card,
  Button,
  Input,
  InputNumber,
  Divider,
  Space,
  Table,
  Row,
  Col,
  Tag,
  List,
  Timeline,
  Alert
} from 'ant-design-vue'
import CodeEditor from '@/components/CodeEditor.vue'

const { Title, Paragraph, Text } = Typography
const {
  user,
  counter,
  message,
  doubleCounter,
  logs,
  reactiveCode,
  addHobby,
  removeHobby,
  addNewProperty
} = useReactiveSystem()
const { comparisonColumns, comparisonData, proxyAdvantages } = useStaticData()
</script>

<template>
  <div class="reactive-system">
    <Typography>
      <Title :level="2">Vue3 响应式系统</Title>
      <Paragraph>
        Vue3的响应式系统是基于ES6 Proxy实现的，相比Vue2的Object.defineProperty有很多优势。
      </Paragraph>
    </Typography>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">1. Proxy 响应式原理</Title>
      </Typography>

      <Card class="example-card">
        <Alert
          message="Vue3使用ES6 Proxy实现响应式系统"
          description="Proxy提供了对象操作的元编程能力，可以拦截并自定义对象的基本操作。"
          type="info"
          showIcon
          style="margin-bottom: 16px"
        />

        <List
          header={<div style="font-weight: 500">Vue3 Proxy响应式系统的优势</div>}
          bordered
          dataSource={proxyAdvantages}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text>
                <Text code>✓</Text> {item}
              </Typography.Text>
            </List.Item>
          )}
          style="margin-bottom: 16px"
        />

        <Card title="Proxy响应式系统简化实现" size="small">
          <CodeEditor :code="reactiveCode" language="javascript" :readOnly="true" height="300px" />
        </Card>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">2. 响应式演示</Title>
      </Typography>

      <Row :gutter="[16, 16]">
        <Col :xs="24" :md="8">
          <Card title="基础类型响应式 (ref)" class="demo-card">
            <Space direction="vertical" style="width: 100%">
              <div class="demo-row">
                <Text strong>计数器:</Text>
                <div class="control-group">
                  <InputNumber v-model:value="counter" :min="0" :max="100" />
                  <Button type="primary" size="small" @click="counter++">+1</Button>
                  <Button danger size="small" @click="counter--">-1</Button>
                </div>
              </div>

              <div class="demo-row">
                <Text strong>双倍值:</Text>
                <Tag color="blue">{{ doubleCounter }}</Tag>
              </div>

              <div class="demo-row">
                <Text strong>消息:</Text>
                <Input v-model:value="message" placeholder="输入消息" />
              </div>
            </Space>
          </Card>
        </Col>

        <Col :xs="24" :md="8">
          <Card title="对象响应式 (reactive)" class="demo-card">
            <Space direction="vertical" style="width: 100%">
              <div class="demo-row">
                <Text strong>姓名:</Text>
                <Input v-model:value="user.name" placeholder="输入姓名" />
              </div>

              <div class="demo-row">
                <Text strong>年龄:</Text>
                <InputNumber v-model:value="user.age" :min="0" :max="120" />
              </div>

              <div class="demo-row">
                <Text strong>城市:</Text>
                <Input v-model:value="user.address.city" placeholder="输入城市" />
              </div>

              <div class="demo-row">
                <Text strong>区域:</Text>
                <Input v-model:value="user.address.district" placeholder="输入区域" />
              </div>

              <Button type="primary" @click="addNewProperty">
                添加新属性
              </Button>
            </Space>
          </Card>
        </Col>

        <Col :xs="24" :md="8">
          <Card title="数组响应式" class="demo-card">
            <div class="demo-row">
              <Text strong>爱好:</Text>
              <div class="hobby-list">
                <Space wrap>
                  <Tag
                    v-for="(hobby, index) in user.hobbies"
                    :key="hobby"
                    :color="['blue', 'green', 'purple', 'cyan'][index % 4]"
                    closable
                    @close="removeHobby(index)"
                  >
                    {{ hobby }}
                  </Tag>
                  <Button type="dashed" size="small" @click="addHobby">
                    + 添加爱好
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">3. 响应式变化日志</Title>
      </Typography>

      <Card class="example-card">
        <Timeline>
          <Timeline.Item
            v-for="(log, index) in logs"
            :key="index"
            :color="['blue', 'green', 'red'][index % 3]"
          >
            <Text code>{{ log }}</Text>
          </Timeline.Item>
          <Timeline.Item v-if="logs.length === 0" color="gray">
            <Text type="secondary">尝试修改上面的值，这里会显示变化日志</Text>
          </Timeline.Item>
        </Timeline>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">4. Vue2 vs Vue3 响应式系统对比</Title>
      </Typography>

      <Card class="example-card">
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
.reactive-system {
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

.demo-row {
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.hobby-list {
  margin-top: 8px;
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

:deep(.ant-input), :deep(.ant-input-number) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-btn) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-table) {
  border-radius: var(--border-radius-sm);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--primary-color-light);
}

:deep(.ant-tag) {
  border-radius: var(--border-radius-sm);
  margin-right: 8px;
  margin-bottom: 8px;
}

:deep(.ant-timeline-item-tail) {
  border-left-style: dashed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .example-card {
    border-radius: var(--border-radius-sm);
  }

  :deep(.ant-card-body) {
    padding: 12px;
  }

  .control-group {
    flex-wrap: wrap;
  }
}
</style>