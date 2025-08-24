import { Tabs, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { Layout } from 'antd'
import stylesLayout from '@/layouts/container.module.less'
import DemoImagePerformance from './examples/DemoImagePerformance';
import React from 'react';

const { Title, Paragraph } = Typography;

/**
 * @description 性能优化页面
 * @returns
 */
export function PerformancePage() {
  const items = [
    {
      key: 'imagePerformance',
      label: '图片性能优化',
      children: <DemoImagePerformance />
    },
  ]

  return (
    <Layout className={stylesLayout.contentLayout}>
      <Content>
        <Typography>
          <Title level={2}>性能优化</Title>
          <Paragraph>
            本页面展示了性能优化的实现，包括图片性能优化。
          </Paragraph>
        </Typography>

        <Tabs
          defaultActiveKey="imagePerformance"
          tabPosition="left"
          style={{ marginTop: 20 }}
        >
          {items.map((item) => (
            <Tabs.TabPane key={item.key} tab={item.label}>
              {item.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Content>
    </Layout>
  )
}

export default React.memo(PerformancePage);