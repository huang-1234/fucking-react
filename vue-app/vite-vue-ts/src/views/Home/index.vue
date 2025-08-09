<script setup lang="ts">
import { useHome } from './Home'
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider
} from 'ant-design-vue'

const { Title, Paragraph } = Typography
const { features, benefits, navigateTo } = useHome()
</script>

<template>
  <div class="home-container">
    <section class="hero">
      <Typography>
        <Title :level="1" class="hero-title">Vue3 学习平台</Title>
        <Paragraph class="subtitle">深入学习Vue3的核心特性和最佳实践</Paragraph>
      </Typography>
      <Space size="middle">
        <Button
          type="primary"
          size="large"
          @click="navigateTo('/vue3/composition-api')"
          class="primary-button"
        >
          开始学习
        </Button>
        <Button
          size="large"
          @click="navigateTo('/playground')"
        >
          在线编辑器
        </Button>
      </Space>
    </section>

    <Divider />

    <section class="features-section">
      <Typography>
        <Title :level="2" class="section-title">核心特性</Title>
      </Typography>
      <Row :gutter="[24, 24]">
        <Col
          v-for="feature in features"
          :key="feature.title"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="6"
          :xl="6"
        >
          <Card
            hoverable
            class="feature-card"
            @click="navigateTo(feature.path)"
          >
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <Typography>
              <Title :level="4">{{ feature.title }}</Title>
              <Paragraph>{{ feature.description }}</Paragraph>
            </Typography>
          </Card>
        </Col>
      </Row>
    </section>

    <Divider />

    <section class="benefits-section">
      <Typography>
        <Title :level="2" class="section-title">为什么选择Vue3?</Title>
      </Typography>
      <Row :gutter="[24, 24]">
        <Col
          v-for="benefit in benefits"
          :key="benefit.title"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="6"
          :xl="6"
        >
          <Card class="benefit-card">
            <div class="benefit-header">
              <component :is="benefit.icon" />
              <Title :level="4">{{ benefit.title }}</Title>
            </div>
            <Paragraph>{{ benefit.description }}</Paragraph>
          </Card>
        </Col>
      </Row>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.hero {
  text-align: center;
  padding: 48px 0;
}

.hero-title {
  color: #42b883 !important;
  margin-bottom: 16px !important;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 32px !important;
}

.primary-button {
  background-color: #42b883 !important;
  border-color: #42b883 !important;
}

.section-title {
  text-align: center;
  margin-bottom: 32px !important;
}

.features-section,
.benefits-section {
  padding: 24px 0;
}

.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.benefit-card {
  height: 100%;
}

.benefit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.benefit-header h4 {
  margin: 0 !important;
}

:deep(.ant-typography) {
  margin-bottom: 0;
}
</style>