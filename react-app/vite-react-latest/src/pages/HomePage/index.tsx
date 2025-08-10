import React from 'react';
import { Typography, Card, Row, Col, Button, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  CodeOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  RocketOutlined,
  CodeSandboxOutlined
} from '@ant-design/icons';
import { CodeBlock } from '../../components/CodeBlock';
import { reactText } from './react-text';

const { Title, Paragraph } = Typography;

/**
 * 首页组件
 */
const HomePage: React.FC = () => {
  const reactVersions = [
    {
      version: '15',
      year: '2016',
      key: 'react15',
      color: '#1890ff',
      features: ['类组件', 'PropTypes', '生命周期']
    },
    {
      version: '16',
      year: '2017',
      key: 'react16',
      color: '#52c41a',
      features: ['Fiber架构', 'Fragments', 'Error Boundaries', 'Hooks']
    },
    {
      version: '17',
      year: '2020',
      key: 'react17',
      color: '#fa8c16',
      features: ['新JSX转换', '事件系统改进', '渐进式升级']
    },
    {
      version: '18',
      year: '2022',
      key: 'react18',
      color: '#722ed1',
      features: ['并发渲染', 'Suspense SSR', '自动批处理', 'useTransition']
    },
    {
      version: '19',
      year: '2023',
      key: 'react19',
      color: '#eb2f96',
      features: ['React Compiler', 'Actions API', 'useFormState']
    }
  ];

  return (
    <div className="home-page">
      <Card bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={1}>React多版本API学习平台</Title>
            <Paragraph style={{ fontSize: 16 }}>
              基于React 19实现，通过沙盒隔离技术模拟React 15-18的API特性
            </Paragraph>
          </div>

          <Divider>
            <Space>
              <HistoryOutlined />
              <span>React版本演进</span>
            </Space>
          </Divider>

          <Row gutter={[16, 16]}>
            {reactVersions.map(version => (
              <Col xs={24} sm={12} md={8} key={version.key}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>React {version.version}</span>
                      <small style={{ color: '#888' }}>{version.year}</small>
                    </div>
                  }
                  extra={
                    <Link to={`/${version.key}`}>
                      <Button type="link" size="small">
                        查看
                      </Button>
                    </Link>
                  }
                  style={{
                    height: '100%',
                    borderTop: `2px solid ${version.color}`
                  }}
                >
                  <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                    {version.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider>
            <Space>
              <RocketOutlined />
              <span>快速开始</span>
            </Space>
          </Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card
                title={
                  <Space>
                    <CodeOutlined />
                    <span>核心API示例</span>
                  </Space>
                }
              >
                <Paragraph>
                  从React 15到React 19的核心API演示，包括Hooks、Fragments、Error Boundaries等。
                  通过实际示例了解不同版本的特性和用法。
                </Paragraph>
                <div style={{ textAlign: 'right' }}>
                  <Link to="/react16/hooks">
                    <Button type="primary">
                      查看Hooks示例
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card
                title={
                  <Space>
                    <ExperimentOutlined />
                    <span>最新特性</span>
                  </Space>
                }
              >
                <Paragraph>
                  体验React 19的最新特性，包括React Compiler自动优化、
                  useFormState表单处理以及其他创新功能。
                </Paragraph>
                <div style={{ textAlign: 'right' }}>
                  <Link to="/react19/react-compiler">
                    <Button type="primary">
                      探索React Compiler
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider>
            <Space>
              <CodeSandboxOutlined />
              <span>代码示例</span>
            </Space>
          </Divider>

          <Card title="增强的代码块展示">
            <Paragraph>
              下面是使用 react-markdown 增强的代码块展示效果：
            </Paragraph>
            <CodeBlock
              language="jsx"
              width="100%"
              code={reactText}
            />
          </Card>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Paragraph type="secondary">
              本平台使用React 19 + Vite + Ant Design 5.26.7构建，
              旨在帮助开发者了解React的演进历程和各版本特性。
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default HomePage;