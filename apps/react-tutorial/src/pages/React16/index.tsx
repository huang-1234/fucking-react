import React from 'react';
import { Typography, Divider, List, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/**
 * React 16 版本概览页面
 */
const React16Page: React.FC = () => {
  const features = [
    {
      title: 'Hooks',
      description: 'React 16.8引入的Hooks让函数组件可以使用状态和其他React特性。',
      link: '/react16/hooks'
    },
    {
      title: 'Error Boundaries',
      description: '错误边界组件可以捕获子组件树中的JavaScript错误，防止整个应用崩溃。',
      link: '/react16/error-boundaries'
    },
    {
      title: 'Fragments',
      description: '允许组件返回多个元素，无需添加额外的DOM节点。',
      link: '/react16/hooks' // 暂时链接到hooks页面
    }
  ];

  return (
    <div className="react16-page">
      <Typography>
        <Title level={2}>React 16 特性概览</Title>
        <Paragraph>
          React 16（代号"Fiber"）是React的一次重大架构重写，发布于2017年9月。
          这个版本引入了全新的核心算法，支持异步渲染，并带来了许多新特性。
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

        <Divider orientation="left">Fiber架构</Divider>
        <Paragraph>
          React 16的核心是全新的Fiber协调引擎，它允许：
        </Paragraph>
        <ul>
          <li>渲染工作可以分片进行</li>
          <li>渲染任务可以被中断、恢复和优先级排序</li>
          <li>更好的错误处理机制</li>
          <li>改进的服务器端渲染</li>
        </ul>

        <Paragraph>
          本示例环境使用React 19实现，通过特殊技术模拟React 16的行为和API，
          让你可以体验不同版本的React特性而不需要安装多个版本。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default React16Page;