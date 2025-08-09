<script setup lang="ts">
import { useHome } from './Home'
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Avatar
} from 'ant-design-vue'

const { Title, Paragraph, Text } = Typography
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
          shape="round"
          @click="navigateTo('/vue3/composition-api')"
          class="primary-button"
        >
          开始学习
        </Button>
        <Button
          size="large"
          shape="round"
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
      <Row :gutter="[16, 16]">
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
            :bodyStyle="{ padding: '16px' }"
          >
            <div class="feature-icon">
              <Avatar :size="48" class="feature-avatar">
                <component :is="feature.icon" />
              </Avatar>
            </div>
            <Typography>
              <Title :level="4" class="feature-title">{{ feature.title }}</Title>
              <Paragraph class="feature-desc">{{ feature.description }}</Paragraph>
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
      <Row :gutter="[16, 16]">
        <Col
          v-for="benefit in benefits"
          :key="benefit.title"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="6"
          :xl="6"
        >
          <Card
            class="benefit-card"
            :bodyStyle="{ padding: '16px' }"
          >
            <div class="benefit-header">
              <Avatar :size="40" class="benefit-avatar">
                <component :is="benefit.icon" />
              </Avatar>
              <Title :level="4" class="benefit-title">{{ benefit.title }}</Title>
            </div>
            <Paragraph class="benefit-desc">{{ benefit.description }}</Paragraph>
          </Card>
        </Col>
      </Row>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 32px 0;
}

.hero-title {
  color: var(--primary-color) !important;
  margin-bottom: 12px !important;
  font-size: 2.5rem !important;
}

.subtitle {
  font-size: 16px;
  margin-bottom: 24px !important;
  opacity: 0.8;
}

.primary-button {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.section-title {
  text-align: center;
  margin-bottom: 24px !important;
  font-size: 1.75rem !important;
}

.features-section,
.benefits-section {
  padding: 16px 0;
}

.feature-card {
  height: 100%;
  border-radius: var(--border-radius-md);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-hover);
}

.feature-icon {
  margin-bottom: 12px;
  display: flex;
}

.feature-avatar {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
}

.feature-title {
  font-size: 16px !important;
  margin-bottom: 8px !important;
}

.feature-desc {
  font-size: 14px;
  margin-bottom: 0 !important;
  color: var(--text-color-secondary);
}

.benefit-card {
  height: 100%;
  border-radius: var(--border-radius-md);
  transition: transform 0.2s, box-shadow 0.2s;
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-hover);
}

.benefit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.benefit-avatar {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
}

.benefit-title {
  margin: 0 !important;
  font-size: 16px !important;
}

.benefit-desc {
  font-size: 14px;
  margin: 0 !important;
  color: var(--text-color-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero {
    padding: 24px 0;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .section-title {
    font-size: 1.5rem !important;
  }
}
</style>