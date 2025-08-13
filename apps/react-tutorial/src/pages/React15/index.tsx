import React from 'react';
import { Typography, Divider, List, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/**
 * React 15 版本概览页面
 */
const React15Page: React.FC = () => {
  const features = [
    {
      title: 'Fragments',
      description: '在React 15中，组件必须返回单个根元素，不支持片段(Fragments)。',
      link: '/react15/fragments'
    },
    {
      title: 'PropTypes',
      description: 'React 15中，PropTypes用于组件属性类型检查，内置在React核心包中。',
      link: '/react15/proptypes'
    },
    {
      title: '类组件生命周期',
      description: '完整支持componentWillMount、componentDidMount等生命周期方法。',
      link: '/react15/fragments'
    }
  ];

  return (
    <div className="react15-page">
      <Typography>
        <Title level={2}>React 15 特性概览</Title>
        <Paragraph>
          React 15是React的一个重要版本，发布于2016年4月。这个版本主要聚焦于稳定性和性能改进，
          为后续版本的重大架构变更奠定了基础。
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

        <Divider orientation="left">历史意义</Divider>
        <Paragraph>
          React 15是Fiber架构重写前的最后一个主要版本，它代表了React早期设计理念的集大成者。
          在这个版本中，React团队解决了许多性能和稳定性问题，为React 16中的完全重写做准备。
        </Paragraph>

        <Paragraph>
          本示例环境使用React 19实现，通过特殊技术模拟React 15的行为和API，
          让你可以体验不同版本的React特性而不需要安装多个版本。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default React15Page;