import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider, Steps, Alert, Tabs } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import {
  asyncAwaitBasicsCode,
  comparisonCode,
  errorHandlingCode,
  parallelExecutionCode,
  patternCode,
  underTheHoodCode,
  asyncSteps,
} from './common';
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;



const AsyncAwaitModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // 模拟执行async函数
  const simulateAsyncExecution = () => {
    setCurrentStep(0);
    setIsRunning(true);

    const timer = setInterval(() => {
      setCurrentStep(prevStep => {
        const nextStep = prevStep + 1;
        if (nextStep >= asyncSteps.length) {
          clearInterval(timer);
          setIsRunning(false);
          return asyncSteps.length - 1;
        }
        return nextStep;
      });
    }, 1500);

    return () => clearInterval(timer);
  };

  return (
    <div>
      <Title level={3}>从Promise到Async/Await的演变</Title>
      <Paragraph>
        Async/Await是JavaScript中处理异步操作的现代方式，它基于Promise构建，提供了更简洁、更易读的语法。
        本模块将介绍Async/Await的基本概念、与Promise的比较、错误处理、并行执行以及实现原理。
      </Paragraph>

      <Tabs
        defaultActiveKey="basics"
        items={[
          {
            key: 'basics',
            label: 'Async/Await基础',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Async/Await基础概念">
                    <Paragraph>
                      <Text strong>async</Text>关键字用于声明一个异步函数，该函数会返回一个Promise。
                      <Text strong>await</Text>关键字用于等待Promise完成，它只能在async函数内部使用。
                    </Paragraph>
                    <Paragraph>
                      当JavaScript引擎遇到await关键字时，它会暂停async函数的执行，等待Promise完成后再恢复执行。
                      这使得异步代码看起来更像同步代码，提高了可读性和可维护性。
                    </Paragraph>
                    <CodeBlock code={asyncAwaitBasicsCode} language="javascript" />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="Async/Await执行流程可视化">
                    <Row gutter={16}>
                      <Col span={16}>
                        <Steps
                          direction="vertical"
                          current={currentStep}
                          status={isRunning ? 'process' : 'finish'}
                        >
                          {asyncSteps.map((step, index) => (
                            <Step
                              key={index}
                              title={step.title}
                              description={step.description}
                              icon={
                                isRunning && index === currentStep ? <LoadingOutlined /> :
                                index <= currentStep ? <CheckCircleOutlined /> : undefined
                              }
                            />
                          ))}
                        </Steps>
                      </Col>
                      <Col span={8}>
                        <Card
                          title="当前执行代码"
                          size="small"
                          style={{ marginBottom: 16 }}
                        >
                          <pre style={{ margin: 0 }}>
                            <code>{asyncSteps[currentStep].code}</code>
                          </pre>
                        </Card>
                        <Button
                          type="primary"
                          icon={<SyncOutlined />}
                          onClick={simulateAsyncExecution}
                          loading={isRunning}
                          block
                        >
                          {isRunning ? '模拟执行中...' : '模拟执行'}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'comparison',
            label: '与Promise比较',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Async/Await vs Promise链">
                    <Paragraph>
                      Async/Await和Promise链都用于处理异步操作，但Async/Await提供了更清晰、更接近同步代码的写法。
                      下面是两种方式的比较：
                    </Paragraph>
                    <CodeBlock code={comparisonCode} language="javascript" />
                    <Divider />
                    <Title level={4}>主要区别</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card title="Promise链" size="small">
                          <ul>
                            <li>使用.then()和.catch()链式调用</li>
                            <li>嵌套Promise可能导致回调地狱</li>
                            <li>错误处理需要在每个链中或使用.catch()</li>
                            <li>代码结构可能较为复杂</li>
                          </ul>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="Async/Await" size="small">
                          <ul>
                            <li>使用try/catch进行错误处理</li>
                            <li>代码结构更接近同步代码</li>
                            <li>可以使用常规的循环和条件语句</li>
                            <li>调试更容易（断点、单步执行）</li>
                          </ul>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'errorHandling',
            label: '错误处理',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Async/Await错误处理">
                    <Paragraph>
                      Async/Await使用try/catch语句处理错误，这与同步代码的错误处理方式相同，使代码更加一致和易读。
                    </Paragraph>
                    <CodeBlock code={errorHandlingCode} language="javascript" />
                    <Divider />
                    <Alert
                      message="错误处理最佳实践"
                      description={
                        <ul>
                          <li>在适当的级别使用try/catch，不要过度嵌套</li>
                          <li>对特定类型的错误进行区分处理</li>
                          <li>使用finally块进行清理操作</li>
                          <li>考虑在高层函数中集中处理错误，而不是在每个低层函数中都添加try/catch</li>
                          <li>返回有意义的错误信息，便于调试</li>
                        </ul>
                      }
                      type="info"
                      showIcon
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'parallel',
            label: '并行执行',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="并行执行异步操作">
                    <Paragraph>
                      虽然Async/Await使代码看起来像是同步执行，但有时我们需要并行执行多个异步操作以提高性能。
                      以下是几种在Async/Await中实现并行执行的方法。
                    </Paragraph>
                    <CodeBlock code={parallelExecutionCode} language="javascript" />
                    <Divider />
                    <Alert
                      message="性能比较"
                      description={
                        <div>
                          <p>假设每个请求需要1秒钟：</p>
                          <ul>
                            <li><Text strong>串行执行</Text>：总时间约为3秒（1秒 + 1秒 + 1秒）</li>
                            <li><Text strong>并行执行</Text>：总时间约为1秒（所有请求同时发起）</li>
                          </ul>
                          <p>对于独立的异步操作，并行执行通常能显著提高性能。</p>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'patterns',
            label: '实用模式',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Async/Await实用模式">
                    <Paragraph>
                      以下是一些使用Async/Await的常见模式，可以帮助处理各种异步场景。
                    </Paragraph>
                    <CodeBlock code={patternCode} language="javascript" />
                    <Divider />
                    <Title level={4}>其他实用模式</Title>
                    <ul>
                      <li><Text strong>顺序映射</Text>：对数组元素按顺序执行异步操作</li>
                      <li><Text strong>条件重试</Text>：根据返回结果决定是否重试</li>
                      <li><Text strong>缓存结果</Text>：缓存异步操作的结果，避免重复请求</li>
                      <li><Text strong>取消操作</Text>：结合AbortController实现可取消的异步操作</li>
                      <li><Text strong>轮询</Text>：定期检查资源状态直到满足条件</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'underTheHood',
            label: '实现原理',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Async/Await的实现原理">
                    <Paragraph>
                      Async/Await实际上是Generator函数和Promise的语法糖。JavaScript引擎会将async函数转换为Generator函数，
                      并自动执行它。下面是一个简化版的实现原理。
                    </Paragraph>
                    <CodeBlock code={underTheHoodCode} language="javascript" />
                    <Divider />
                    <Alert
                      message="Babel转译示例"
                      description={
                        <div>
                          <p>Babel等转译工具会将async/await代码转换为可以在旧版浏览器中运行的代码，主要步骤：</p>
                          <ol>
                            <li>将async函数转换为返回Promise的普通函数</li>
                            <li>使用状态机模拟Generator的行为</li>
                            <li>处理await表达式，将其转换为Promise链</li>
                            <li>管理函数的暂停和恢复</li>
                          </ol>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
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

export default AsyncAwaitModule;
