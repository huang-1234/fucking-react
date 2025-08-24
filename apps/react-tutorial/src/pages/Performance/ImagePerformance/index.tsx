import React from 'react';
import { Typography, Layout } from 'antd';
import stylesLayout from '@/layouts/container.module.less';
const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ModuleImagePerformance: React.FC = () => {
  return (
    <Layout className={stylesLayout.contentLayout}>
      <Content>
        <Typography>
          <Title level={2}>图片性能优化</Title>
          <Paragraph>
            本页面展示了图片性能优化的实现，包括图片懒加载、图片预加载。
          </Paragraph>
        </Typography>
      </Content>
    </Layout>
  );
};

export default React.memo(ModuleImagePerformance);
