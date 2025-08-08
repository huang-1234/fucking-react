import React from 'react';
import { Typography, Divider, List, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/**
 * React 17 版本概览页面
 */
const React17Page: React.FC = () => {
  const features = [
    {
      title: '新的JSX转换',
      description: '无需显式导入React即可使用JSX，简化了代码。',
      link: '/react17/new-jsx'
    },
    {
      title: '事件委托机制',
      description: 'React 17改变了事件委托的实现方式，不再绑定到document上。',
      link: '/react17/event-delegation'
    },
    {
      title: '渐进式升级',
      description: 'React 17设计为"过渡版本"，支持不同版本React的嵌套使用。',
      link: '/react17/new-jsx' // 暂时链接到new-jsx页面
    }
  ];

  return (
    <div className="react17-page">
      <Typography>
        <Title level={2}>React 17 特性概览</Title>
        <Paragraph>
          React 17发布于2020年10月，是一个特殊的版本，没有添加面向开发者的新特性，
          而是专注于升级React本身的内部架构，为未来的功能铺平道路。
        </Paragraph>

        <Divider orientation="left">主要变更</Divider>

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

        <Divider orientation="left">过渡版本的意义</Divider>
        <Paragraph>
          React 17被称为"过渡版本"，它的主要目标是：
        </Paragraph>
        <ul>
          <li>允许渐进式升级，支持在同一页面中嵌套不同版本的React</li>
          <li>为将来的重大更新（如React 18的并发特性）做准备</li>
          <li>改进事件系统，解决与第三方代码的兼容性问题</li>
          <li>减少与旧浏览器的兼容性代码，降低包体积</li>
        </ul>

        <Paragraph>
          本示例环境使用React 19实现，通过特殊技术模拟React 17的行为和API，
          让你可以体验不同版本的React特性而不需要安装多个版本。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default React17Page;