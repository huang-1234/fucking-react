<script setup lang="ts">
import { useCompositionAPI, useStaticData } from './CompositionAPI'
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
  Tag
} from 'ant-design-vue'
import CodeEditor from '@/components/CodeEditor.vue'

const { Title, Paragraph, Text } = Typography
const { count, user, doubleCount, fullName, customCounter, increment, decrement, reset } = useCompositionAPI()
// use useStaticData
const { comparisonColumns, comparisonData, refReactiveCode, computedCode, compositionFunctionCode, lifecycleCode } = useStaticData()
</script>

<template>
  <div class="composition-api">
    <Typography>
      <Title :level="2">Composition API</Title>
      <Paragraph>
        Composition API是Vue3引入的新API，它提供了一种更灵活的方式来组织组件逻辑，特别适合处理复杂组件。
      </Paragraph>
    </Typography>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">1. ref 和 reactive</Title>
        <Paragraph>
          <Text type="secondary">ref用于基本类型，reactive用于对象类型，它们是Vue3响应式系统的基础。</Text>
        </Paragraph>
      </Typography>

      <Card class="example-card">
        <Row :gutter="[16, 16]">
          <Col :xs="24" :md="12">
            <Card title="演示" size="small" class="demo-card">
              <Space direction="vertical" style="width: 100%">
                <div class="counter-demo">
                  <Paragraph>计数器: {{ count }}</Paragraph>
                  <Button type="primary" @click="count++">增加</Button>
                </div>

                <Divider />

                <div class="user-demo">
                  <Title :level="5">用户信息</Title>
                  <Space direction="vertical" style="width: 100%">
                    <div>
                      <Text>姓名:</Text>
                      <Input v-model:value="user.name" style="width: 200px; margin-left: 8px" />
                    </div>
                    <div>
                      <Text>年龄:</Text>
                      <InputNumber v-model:value="user.age" style="width: 200px; margin-left: 8px" />
                    </div>
                    <div>
                      <Text>城市:</Text>
                      <Input v-model:value="user.address.city" style="width: 200px; margin-left: 8px" />
                    </div>
                    <div>
                      <Text>区域:</Text>
                      <Input v-model:value="user.address.district" style="width: 200px; margin-left: 8px" />
                    </div>
                  </Space>

                  <Card class="result-card" size="small" style="margin-top: 16px">
                    <Paragraph>当前用户: {{ user.name }}, {{ user.age }}岁</Paragraph>
                    <Paragraph>地址: {{ user.address.city }} {{ user.address.district }}</Paragraph>
                  </Card>
                </div>
              </Space>
            </Card>
          </Col>

          <Col :xs="24" :md="12">
            <Card title="代码" size="small" class="code-card">
              <CodeEditor :code="refReactiveCode" language="javascript" :readOnly="true" height="300px" />
            </Card>
          </Col>
        </Row>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">2. computed 计算属性</Title>
        <Paragraph>
          <Text type="secondary">计算属性可以根据响应式状态派生出新的状态，当依赖变化时会自动更新。</Text>
        </Paragraph>
      </Typography>

      <Card class="example-card">
        <Row :gutter="[16, 16]">
          <Col :xs="24" :md="12">
            <Card title="演示" size="small" class="demo-card">
              <Space direction="vertical" style="width: 100%">
                <Paragraph>计数: {{ count }}</Paragraph>
                <Paragraph>双倍计数: <Tag color="blue">{{ doubleCount }}</Tag></Paragraph>
                <Paragraph>用户全名: <Tag color="green">{{ fullName }}</Tag></Paragraph>
                <Button type="primary" @click="count++">增加计数</Button>
              </Space>
            </Card>
          </Col>

          <Col :xs="24" :md="12">
            <Card title="代码" size="small" class="code-card">
              <CodeEditor :code="computedCode" language="javascript" :readOnly="true" height="200px" />
            </Card>
          </Col>
        </Row>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">3. 自定义组合函数</Title>
        <Paragraph>
          <Text type="secondary">组合函数是Composition API的核心优势，它使逻辑复用变得简单和直观。</Text>
        </Paragraph>
      </Typography>

      <Card class="example-card">
        <Row :gutter="[16, 16]">
          <Col :xs="24" :md="12">
            <Card title="演示" size="small" class="demo-card">
              <Space direction="vertical" style="width: 100%">
                <Paragraph>自定义计数器: <Tag color="purple">{{ customCounter }}</Tag></Paragraph>
                <Space>
                  <Button type="primary" @click="increment">+5</Button>
                  <Button danger @click="decrement">-5</Button>
                  <Button @click="reset">重置</Button>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col :xs="24" :md="12">
            <Card title="代码" size="small" class="code-card">
              <CodeEditor :code="compositionFunctionCode" language="javascript" :readOnly="true" height="300px" />
            </Card>
          </Col>
        </Row>
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">4. 生命周期钩子</Title>
        <Paragraph>
          <Text type="secondary">Vue3的生命周期钩子可以直接在setup函数中使用，更加灵活。</Text>
        </Paragraph>
      </Typography>

      <Card class="example-card">
        <CodeEditor :code="lifecycleCode" language="javascript" :readOnly="true" height="200px" />
      </Card>
    </section>

    <Divider />

    <section class="example-section">
      <Typography>
        <Title :level="3">5. Composition API vs Options API</Title>
        <Paragraph>
          <Text type="secondary">两种API的对比，帮助你理解何时使用Composition API。</Text>
        </Paragraph>
      </Typography>

      <Card class="example-card">
        <Table :columns="comparisonColumns" :dataSource="comparisonData" :pagination="false" />
      </Card>
    </section>
  </div>
</template>

<style scoped>
.composition-api {
  width: 100%;
}

.example-section {
  margin-bottom: 24px;
}

.example-card {
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.demo-card, .code-card {
  height: 100%;
  border-radius: var(--border-radius-sm);
}

.result-card {
  background-color: var(--primary-color-light);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .example-card {
    border-radius: var(--border-radius-sm);
  }

  :deep(.ant-card-body) {
    padding: 12px;
  }
}
</style>