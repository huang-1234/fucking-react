import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider, Steps, Input, Alert, Tabs, Tag } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import {
  promiseBasicsCode,
  promiseAllCode,
  promiseRaceCode,
  promiseAllSettledCode,
  promiseAnyCode,
  customPromiseCode,
  promisePatternsCode,
  promiseAsyncAwaitCode,
  promiseTestState,
} from './react-text';
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;



const PromiseModule: React.FC = () => {
  const [promiseState, setPromiseState] = useState<'pending' | 'fulfilled' | 'rejected'>('pending');
  const [promiseValue, setPromiseValue] = useState<string>('');
  const [promiseError, setPromiseError] = useState<string>('');
  const [customCode, setCustomCode] = useState<string>(promiseTestState);

  // 模拟Promise执行
  const simulatePromise = (shouldSucceed: boolean = true) => {
    setPromiseState('pending');
    setPromiseValue('');
    setPromiseError('');

    setTimeout(() => {
      if (shouldSucceed) {
        setPromiseState('fulfilled');
        setPromiseValue('操作成功完成');
      } else {
        setPromiseState('rejected');
        setPromiseError('操作执行失败');
      }
    }, 2000);
  };

  // 渲染Promise状态图标
  const renderStateIcon = () => {
    switch (promiseState) {
      case 'pending':
        return <LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'fulfilled':
        return <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
    }
  };

  return (
    <div>
      <Title level={3}>Promise实现与扩展</Title>
      <Paragraph>
        Promise是JavaScript中处理异步操作的强大工具，它提供了一种更优雅的方式来处理回调，避免了回调地狱。
        本模块将介绍Promise的基本概念、常用方法、自定义实现以及实用模式。
      </Paragraph>

      <Tabs
        defaultActiveKey="basics"
        items={[
          {
            key: 'basics',
            label: 'Promise基础',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Promise基础概念">
                    <Paragraph>
                      Promise是一个代表异步操作最终完成或失败的对象。它有三种状态：
                    </Paragraph>
                    <ul>
                      <li><Text strong>pending（进行中）</Text>：初始状态，既不是成功也不是失败</li>
                      <li><Text strong>fulfilled（已成功）</Text>：操作成功完成</li>
                      <li><Text strong>rejected（已失败）</Text>：操作失败</li>
                    </ul>
                    <Paragraph>
                      Promise状态一旦改变，就不会再变。Promise对象的状态改变，只有两种可能：
                      从pending变为fulfilled，或者从pending变为rejected。
                    </Paragraph>
                    <CodeBlock code={promiseBasicsCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="Promise状态演示">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div>
                          {renderStateIcon()}
                        </div>
                        <div>
                          <Text strong>当前状态：</Text>
                          <Tag color={
                            promiseState === 'pending' ? 'blue' :
                            promiseState === 'fulfilled' ? 'green' : 'red'
                          }>
                            {promiseState}
                          </Tag>
                        </div>
                      </div>

                      {promiseState === 'fulfilled' && (
                        <Alert
                          message="Promise已解决(fulfilled)"
                          description={`结果值: ${promiseValue}`}
                          type="success"
                          showIcon
                        />
                      )}

                      {promiseState === 'rejected' && (
                        <Alert
                          message="Promise已拒绝(rejected)"
                          description={`错误原因: ${promiseError}`}
                          type="error"
                          showIcon
                        />
                      )}

                      <div style={{ marginTop: 16 }}>
                        <Space>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => simulatePromise(true)}
                            loading={promiseState === 'pending'}
                          >
                            模拟成功的Promise
                          </Button>
                          <Button
                            danger
                            icon={<PlayCircleOutlined />}
                            onClick={() => simulatePromise(false)}
                            loading={promiseState === 'pending'}
                          >
                            模拟失败的Promise
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'methods',
            label: 'Promise方法',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24} lg={12}>
                  <Card title="Promise.all">
                    <Paragraph>
                      <Text strong>Promise.all</Text>接收一个Promise数组，当所有Promise都成功时返回所有结果数组，
                      如果有任何一个Promise失败，则返回第一个失败的Promise的错误。
                    </Paragraph>
                    <CodeBlock code={promiseAllCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="Promise.race">
                    <Paragraph>
                      <Text strong>Promise.race</Text>接收一个Promise数组，返回最先完成的Promise的结果，
                      无论是成功还是失败。
                    </Paragraph>
                    <CodeBlock code={promiseRaceCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="Promise.allSettled">
                    <Paragraph>
                      <Text strong>Promise.allSettled</Text>接收一个Promise数组，等待所有Promise完成（无论成功或失败），
                      返回一个包含每个Promise状态和结果的对象数组。
                    </Paragraph>
                    <CodeBlock code={promiseAllSettledCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24} lg={12}>
                  <Card title="Promise.any">
                    <Paragraph>
                      <Text strong>Promise.any</Text>接收一个Promise数组，返回第一个成功的Promise的结果。
                      如果所有Promise都失败，则返回一个AggregateError。
                    </Paragraph>
                    <CodeBlock code={promiseAnyCode} language="javascript" />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'implementation',
            label: 'Promise实现',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="自定义Promise实现">
                    <Paragraph>
                      下面是一个简化版的Promise/A+规范实现，包含了核心功能：状态管理、then方法链式调用、错误处理等。
                    </Paragraph>
                    <CodeBlock code={customPromiseCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="测试自定义Promise">
                    <Paragraph>
                      您可以编辑下面的代码，测试自定义Promise的功能。
                    </Paragraph>
                    <TextArea
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      autoSize={{ minRows: 10, maxRows: 15 }}
                      style={{ marginBottom: 16, fontFamily: 'monospace' }}
                    />
                    <Paragraph type="secondary">
                      注意：此处无法实际执行代码，这是一个演示界面。在实际环境中，您可以将自定义Promise实现和测试代码复制到浏览器控制台或Node.js环境中运行。
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'patterns',
            label: 'Promise模式',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Promise实用模式">
                    <Paragraph>
                      以下是一些常用的Promise模式，可以帮助处理各种异步场景。
                    </Paragraph>
                    <CodeBlock code={promisePatternsCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="Promise与Async/Await">
                    <Paragraph>
                      Async/Await是基于Promise的语法糖，使异步代码看起来更像同步代码，提高了可读性。
                    </Paragraph>
                    <CodeBlock code={promiseAsyncAwaitCode} language="javascript" />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
};

export default React.memo(PromiseModule);