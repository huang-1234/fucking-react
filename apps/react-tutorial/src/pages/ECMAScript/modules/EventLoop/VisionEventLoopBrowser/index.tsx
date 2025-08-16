import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Button, Space, List, Tag, Divider, Steps } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  ReloadOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { CodeBlock } from '../../../../../components/CodeBlock';
import { eventLoopSteps } from './event-loop-data';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// 定义任务类型
interface Task {
  id: string;
  type: 'sync' | 'macro' | 'micro';
  content: string;
  status: 'waiting' | 'executing' | 'completed';
  code?: string;
}

// 定义事件循环状态
interface EventLoopState {
  callStack: Task[];
  macroTaskQueue: Task[];
  microTaskQueue: Task[];
  output: string[];
  currentStep: number;
  currentCode: string;
  isRunning: boolean;
  speed: number;
  isCompleted: boolean;
}

// 初始状态
const initialEventLoopState: EventLoopState = {
  callStack: [],
  macroTaskQueue: [],
  microTaskQueue: [],
  output: [],
  currentStep: 0,
  currentCode: eventLoopSteps[0]?.code || '',
  isRunning: false,
  speed: 1000, // 毫秒
  isCompleted: false
};

const VisionEventLoopBrowser: React.FC = () => {
  // 状态
  const [eventLoopState, setEventLoopState] = useState<EventLoopState>(initialEventLoopState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 重置事件循环
  const resetEventLoop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setEventLoopState(initialEventLoopState);
  };

  // 开始/暂停事件循环可视化
  const toggleRunning = () => {
    if (eventLoopState.isCompleted) {
      resetEventLoop();
      return;
    }

    setEventLoopState(prevState => ({
      ...prevState,
      isRunning: !prevState.isRunning
    }));
  };

  // 执行下一步
  const stepForward = () => {
    if (eventLoopState.isCompleted) {
      return;
    }

    const nextStep = eventLoopState.currentStep + 1;
    if (nextStep < eventLoopSteps.length) {
      const stepData = eventLoopSteps[nextStep];
      setEventLoopState(prevState => ({
        ...prevState,
        callStack: [...stepData.callStack],
        macroTaskQueue: [...stepData.macroTaskQueue],
        microTaskQueue: [...stepData.microTaskQueue],
        output: [...prevState.output, ...(stepData.output ? [stepData.output] : [])],
        currentStep: nextStep,
        currentCode: stepData.code || prevState.currentCode,
        isCompleted: nextStep === eventLoopSteps.length - 1
      }));
    } else {
      setEventLoopState(prevState => ({
        ...prevState,
        isRunning: false,
        isCompleted: true
      }));
    }
  };

  // 调整速度
  const changeSpeed = (newSpeed: number) => {
    setEventLoopState(prevState => ({
      ...prevState,
      speed: newSpeed
    }));
  };

  // 自动执行事件循环
  useEffect(() => {
    if (eventLoopState.isRunning) {
      timerRef.current = setInterval(() => {
        stepForward();
      }, eventLoopState.speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [eventLoopState.isRunning, eventLoopState.speed, eventLoopState.currentStep]);

  return (
    <div>
      <Title level={3}>事件循环可视化 - Browser</Title>
      <Paragraph>
        这个可视化工具展示了浏览器中JavaScript事件循环的工作原理。
        你可以观察到同步任务、微任务和宏任务的执行顺序，以及调用栈和任务队列的变化。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={eventLoopState.isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={toggleRunning}
                >
                  {eventLoopState.isRunning ? '暂停' : (eventLoopState.isCompleted ? '重置' : '开始')}
                </Button>
                <Button
                  icon={<StepForwardOutlined />}
                  onClick={stepForward}
                  disabled={eventLoopState.isRunning || eventLoopState.isCompleted}
                >
                  下一步
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetEventLoop}
                >
                  重置
                </Button>
                <span>速度：</span>
                <Button
                  size="small"
                  onClick={() => changeSpeed(2000)}
                  type={eventLoopState.speed === 2000 ? 'primary' : 'default'}
                >
                  慢
                </Button>
                <Button
                  size="small"
                  onClick={() => changeSpeed(1000)}
                  type={eventLoopState.speed === 1000 ? 'primary' : 'default'}
                >
                  中
                </Button>
                <Button
                  size="small"
                  onClick={() => changeSpeed(500)}
                  type={eventLoopState.speed === 500 ? 'primary' : 'default'}
                >
                  快
                </Button>
              </Space>
            </div>

            <Divider orientation="left">当前步骤</Divider>
            <div style={{ marginBottom: 16 }}>
              <Steps
                current={eventLoopState.currentStep}
                size="small"
                direction="horizontal"
                style={{ maxWidth: '100%', overflowX: 'auto' }}
              >
                {eventLoopSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={`步骤${index + 1}`}
                    description={step.description}
                  />
                ))}
              </Steps>
            </div>

            <Row gutter={16}>
              <Col span={16}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card title="调用栈" size="small" style={{ marginBottom: 16 }}>
                      {eventLoopState.callStack.length > 0 ? (
                        <List
                          size="small"
                          dataSource={eventLoopState.callStack}
                          renderItem={(item, index) => (
                            <List.Item>
                              <Tag color="blue">{eventLoopState.callStack.length - index}</Tag> {item.content}
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">调用栈为空</Text>
                      )}
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card title="宏任务队列" size="small" style={{ marginBottom: 16 }}>
                      {eventLoopState.macroTaskQueue.length > 0 ? (
                        <List
                          size="small"
                          dataSource={eventLoopState.macroTaskQueue}
                          renderItem={(item) => (
                            <List.Item>
                              <Tag color="orange">{item.type}</Tag> {item.content}
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">宏任务队列为空</Text>
                      )}
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card title="微任务队列" size="small" style={{ marginBottom: 16 }}>
                      {eventLoopState.microTaskQueue.length > 0 ? (
                        <List
                          size="small"
                          dataSource={eventLoopState.microTaskQueue}
                          renderItem={(item) => (
                            <List.Item>
                              <Tag color="green">{item.type}</Tag> {item.content}
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">微任务队列为空</Text>
                      )}
                    </Card>
                  </Col>
                </Row>

                <Card title="控制台输出" size="small">
                  {eventLoopState.output.map((item, index) => (
                    <div key={index} style={{ fontFamily: 'monospace', padding: '4px 0' }}>
                      <CodeOutlined style={{ marginRight: 8 }} /> {item}
                    </div>
                  ))}
                </Card>
              </Col>

              <Col span={8}>
                <Card title="当前执行代码" size="small">
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                    <code>{eventLoopState.currentCode}</code>
                  </pre>
                </Card>

                <Card title="事件循环说明" size="small" style={{ marginTop: 16 }}>
                  <Paragraph>
                    <Text strong>{eventLoopSteps[eventLoopState.currentStep]?.description}</Text>
                  </Paragraph>
                  <Paragraph>
                    {eventLoopSteps[eventLoopState.currentStep]?.explanation}
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="完整代码">
            <CodeBlock code={`console.log('start');

Promise.resolve().then(() => {
  setTimeout(() => {
    console.log('1 timer task promise 1 then setTimeout 2');
  }, 0);
});


setTimeout(() => {
  console.log('===== timer task =====');
}, 0);

async function async1() {
  console.log('sync task: async1 start');
  await async2();
  // 这是一个一阶微任务，在async2执行完之后执行
  console.log('1 promise then resolve 1');
}

async function async2() {
  console.log('sync task: async2 start');
}

async function async3() {
  console.log('sync task: async3 start');
  await async4();
  console.log('2222 await async4 end promise then resolve 3');
}

async function async4() {
  return new Promise((resolve) => {
    console.log('sync task: async4 start');
    setTimeout(() => {
      console.log('1 timer task async4 setTimeout 4');
    }, 0);
    resolve();
  }).then(() => {
    console.log('1 promise then resolve 2');
    new Promise((resolve) => {
      resolve();
    }).then(() => {
      // 这是一个二阶微任务，并不是一个三阶微任务
      console.log('2 promise then resolve 1: 插队成功');
    }).then(() => {
      console.log('2 promise then resolve 2: 插队失败， 放入队尾');
    });
  }).then(() => {
    console.log('2 promise then resolve 1');
  });
}
async1();
async3();

new Promise((resolve) => {
  resolve();
}).then(() => {
  console.log('1 promise then resolve 3');
  setTimeout(() => {
    console.log('2 timer task async4 setTimeout 4');
  }, 0);
}).then(() => {
  console.log('2 promise then resolve 2');
  new Promise((resolve) => {
    resolve();
  }).then(() => {
    // 这是一个二阶微任务，并不是一个三阶微任务
    console.log('22 promise then resolve 1: 插队成功');
  }).then(() => {
    console.log('22 promise then resolve 2: 插队失败， 放入队尾');
  });
});

Promise.resolve().then(() => {
  console.log('1 promise then resolve 4');
});

console.log('end');`} language="javascript" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VisionEventLoopBrowser;
