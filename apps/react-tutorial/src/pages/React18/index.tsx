import React from 'react';
import { Typography, Divider, List, Card } from 'antd';
import { Link } from 'react-router-dom';

import stylesLayout from '@/layouts/container.module.less';
const { Title, Paragraph } = Typography;

/**
 * React 18 版本概览页面
 */
const React18Page: React.FC = () => {
  const features = [
    {
      title: 'Suspense SSR',
      description: '改进的服务器端渲染支持，允许流式传输HTML和选择性注水。',
      link: '/react18/suspense-ssr'
    },
    {
      title: 'useTransition',
      description: '新的Hook允许将状态更新标记为非紧急，提高应用响应性。',
      link: '/react18/use-transition'
    },
    {
      title: '自动批处理',
      description: 'React 18自动将多个状态更新批处理到一次渲染中，提高性能。',
      link: '/react18/use-transition' // 暂时链接到use-transition页面
    }
  ];

  return (
    <div className={stylesLayout.contentLayout}>
      <Typography>
        <Title level={2}>React 18 特性概览</Title>
        <Paragraph>
          React 18发布于2022年3月，引入了期待已久的并发渲染功能，这是React团队研究多年的成果。
          这个版本带来了许多新的API和性能改进，为构建更具响应性的应用提供了基础。
        </Paragraph>

        <Divider orientation="left">主要特性</Divider>

        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={features}
          renderItem={item => (
            <List.Item>
              <Card title={item.title}>
                <Paragraph>{item.description}</Paragraph>
                <Link to={item.link}>查看示例</Link>
              </Card>
            </List.Item>
          )}
        />

        <Divider orientation="left">并发渲染</Divider>
        <Paragraph>
          React 18的核心是并发渲染，它允许React：
        </Paragraph>
        <ul>
          <li>同时准备多个UI版本</li>
          <li>在后台渲染更新而不阻塞主线程</li>
          <li>根据用户交互优先级更新UI</li>
          <li>在渲染完成前展示部分内容</li>
          <li>保持UI响应，即使有大量更新</li>
        </ul>

        <Paragraph>
          本示例环境使用React 19实现，通过特殊技术模拟React 18的行为和API，
          让你可以体验不同版本的React特性而不需要安装多个版本。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default React18Page;