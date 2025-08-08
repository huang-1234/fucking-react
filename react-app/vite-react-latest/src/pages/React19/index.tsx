import React from 'react';
import { Typography, Divider, List, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/**
 * React 19 版本概览页面
 */
const React19Page: React.FC = () => {
  const features = [
    {
      title: 'React Compiler',
      description: 'React 19引入的编译器可以自动优化组件，减少重渲染。',
      link: '/react19/react-compiler'
    },
    {
      title: 'useFormState',
      description: '新的表单状态Hook，简化表单处理并提高性能。',
      link: '/react19/use-form-state'
    },
    {
      title: 'Actions',
      description: '新的服务器操作API，简化客户端和服务器之间的数据交互。',
      link: '/react19/use-form-state' // 暂时链接到use-form-state页面
    }
  ];

  return (
    <div className="react19-page">
      <Typography>
        <Title level={2}>React 19 特性概览</Title>
        <Paragraph>
          React 19是最新的React版本，带来了许多创新特性和性能改进。
          这个版本继续发展React的并发渲染能力，并引入了新的编译优化和API。
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

        <Divider orientation="left">React 19的创新</Divider>
        <Paragraph>
          React 19的核心创新包括：
        </Paragraph>
        <ul>
          <li>React Compiler - 自动优化组件，减少不必要的重渲染</li>
          <li>Actions API - 简化客户端和服务器之间的数据交互</li>
          <li>Document Metadata - 改进的元数据管理</li>
          <li>Asset Loading - 新的资源加载API</li>
          <li>useFormState - 简化表单处理的新Hook</li>
        </ul>

        <Paragraph>
          本示例环境使用React 19实现，展示了最新版React的特性和API。
          通过这些示例，你可以了解React的最新发展方向和最佳实践。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default React19Page;