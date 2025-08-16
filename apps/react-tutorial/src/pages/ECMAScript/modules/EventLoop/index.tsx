import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider, Steps, List, Tag, Tooltip } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// 事件循环基础代码
const eventLoopBasicsCode = `console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序:
// script start
// script end
// promise1
// promise2
// setTimeout`;

// 宏任务与微任务代码
const macroMicroTasksCode = `// 宏任务（MacroTask）示例:
// setTimeout, setInterval, setImmediate, I/O, UI渲染

// 微任务（MicroTask）示例:
// Promise, process.nextTick, MutationObserver

// 执行顺序示例
console.log('1. 同步代码开始');

setTimeout(() => {
  console.log('2. 宏任务 setTimeout 回调');

  Promise.resolve().then(() => {
    console.log('3. 宏任务中的微任务');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4. 微任务 Promise 回调');

  setTimeout(() => {
    console.log('5. 微任务中的宏任务');
  }, 0);
});

console.log('6. 同步代码结束');

// 输出顺序:
// 1. 同步代码开始
// 6. 同步代码结束
// 4. 微任务 Promise 回调
// 2. 宏任务 setTimeout 回调
// 3. 宏任务中的微任务
// 5. 微任务中的宏任务`;

// 复杂事件循环示例
const complexEventLoopCode = `console.log('1. 脚本开始');

setTimeout(() => {
  console.log('2. 第一个宏任务');

  Promise.resolve().then(() => {
    console.log('3. 第一个宏任务中的微任务');

    setTimeout(() => {
      console.log('4. 微任务中的宏任务');
    }, 0);
  });
}, 0);

new Promise((resolve) => {
  console.log('5. Promise 构造函数内部 (同步)');
  resolve();
}).then(() => {
  console.log('6. 第一个微任务');

  return new Promise((resolve) => {
    resolve();
  });
}).then(() => {
  console.log('7. 第二个微任务');

  setTimeout(() => {
    console.log('8. 第二个微任务中的宏任务');

    Promise.resolve().then(() => {
      console.log('9. 第二个宏任务中的微任务');
    });
  }, 0);
});

console.log('10. 脚本结束');

// 输出顺序:
// 1. 脚本开始
// 5. Promise 构造函数内部 (同步)
// 10. 脚本结束
// 6. 第一个微任务
// 7. 第二个微任务
// 2. 第一个宏任务
// 3. 第一个宏任务中的微任务
// 8. 第二个微任务中的宏任务
// 9. 第二个宏任务中的微任务
// 4. 微任务中的宏任务`;

// 浏览器与Node.js事件循环区别
const browserNodeDifferencesCode = `// 浏览器事件循环
setTimeout(() => console.log('timeout1'), 0);
Promise.resolve().then(() => console.log('promise1'));
setTimeout(() => console.log('timeout2'), 0);
Promise.resolve().then(() => console.log('promise2'));

// 浏览器输出:
// promise1
// promise2
// timeout1
// timeout2

// Node.js事件循环 (旧版本，<v11)
// 输出可能是:
// timeout1
// timeout2
// promise1
// promise2

// 注: Node.js v11及以上版本与浏览器行为一致`;

// 模拟事件循环的初始状态
const initialEventLoopState = {
  callStack: [],
  taskQueue: [
    { id: 'script', type: 'script', content: '主脚本', status: 'waiting' }
  ],
  microTaskQueue: [],
  output: [],
  currentStep: 0,
  isRunning: false,
  speed: 1000, // 毫秒
  isCompleted: false
} as EventLoopState;

// 事件循环可视化示例的执行步骤
const eventLoopSteps = [
  {
    description: '开始执行主脚本',
    action: 'script-start',
    callStack: ['主脚本'],
    taskQueue: [],
    microTaskQueue: [],
    output: ['console.log("script start")']
  },
  {
    description: '遇到setTimeout，加入宏任务队列',
    action: 'add-macro',
    callStack: ['主脚本'],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [],
    output: []
  },
  {
    description: '遇到Promise.resolve().then，加入微任务队列',
    action: 'add-micro',
    callStack: ['主脚本'],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [{ id: 'promise1', type: 'micro', content: 'Promise.then回调1', status: 'waiting' }],
    output: []
  },
  {
    description: '执行同步代码console.log("script end")',
    action: 'sync-log',
    callStack: ['主脚本'],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [{ id: 'promise1', type: 'micro', content: 'Promise.then回调1', status: 'waiting' }],
    output: ['console.log("script start")', 'console.log("script end")']
  },
  {
    description: '主脚本执行完毕，出栈',
    action: 'script-end',
    callStack: [],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [{ id: 'promise1', type: 'micro', content: 'Promise.then回调1', status: 'waiting' }],
    output: ['console.log("script start")', 'console.log("script end")']
  },
  {
    description: '检查微任务队列，执行Promise.then回调1',
    action: 'execute-micro',
    callStack: ['Promise.then回调1'],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")']
  },
  {
    description: 'Promise.then回调1执行完毕，产生新的Promise.then回调',
    action: 'add-micro',
    callStack: [],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [{ id: 'promise2', type: 'micro', content: 'Promise.then回调2', status: 'waiting' }],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")']
  },
  {
    description: '执行Promise.then回调2',
    action: 'execute-micro',
    callStack: ['Promise.then回调2'],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")', 'console.log("promise2")']
  },
  {
    description: 'Promise.then回调2执行完毕，微任务队列为空',
    action: 'micro-empty',
    callStack: [],
    taskQueue: [{ id: 'timeout1', type: 'macro', content: 'setTimeout回调', status: 'waiting' }],
    microTaskQueue: [],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")', 'console.log("promise2")']
  },
  {
    description: '执行宏任务队列中的setTimeout回调',
    action: 'execute-macro',
    callStack: ['setTimeout回调'],
    taskQueue: [],
    microTaskQueue: [],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")', 'console.log("promise2")', 'console.log("setTimeout")']
  },
  {
    description: 'setTimeout回调执行完毕，事件循环结束',
    action: 'complete',
    callStack: [],
    taskQueue: [],
    microTaskQueue: [],
    output: ['console.log("script start")', 'console.log("script end")', 'console.log("promise1")', 'console.log("promise2")', 'console.log("setTimeout")']
  }
];

// 自定义任务类型
interface Task {
  id: string;
  type: 'script' | 'macro' | 'micro';
  content: string;
  status: 'waiting' | 'executing' | 'completed';
}

// 自定义事件循环状态
interface EventLoopState {
  callStack: string[];
  taskQueue: Task[];
  microTaskQueue: Task[];
  output: string[];
  currentStep: number;
  isRunning: boolean;
  speed: number;
  isCompleted: boolean;
}

const EventLoopModule: React.FC = () => {
  // 事件循环状态
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
      setEventLoopState((prevState: EventLoopState) => ({
        ...prevState,
        callStack: [...stepData.callStack],
        taskQueue: [...stepData.taskQueue] as Task[],
        microTaskQueue: [...stepData.microTaskQueue] as Task[],
        output: [...stepData.output],
        currentStep: nextStep,
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
      <Title level={3}>浏览器事件循环机制</Title>
      <Paragraph>
        事件循环（Event Loop）是JavaScript处理异步操作的核心机制。JavaScript是单线程的，但通过事件循环，
        它能够执行非阻塞的异步操作。本模块将介绍事件循环的工作原理及可视化演示。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="事件循环基础">
            <Paragraph>
              JavaScript的执行环境包含一个<Text strong>调用栈（Call Stack）</Text>、一个<Text strong>宏任务队列（Macro Task Queue）</Text>
              和一个<Text strong>微任务队列（Micro Task Queue）</Text>。事件循环不断地检查调用栈是否为空，如果为空，则按照一定的规则执行任务队列中的任务。
            </Paragraph>
            <Paragraph>
              <Text strong>执行顺序规则：</Text>
            </Paragraph>
            <ol>
              <li>执行调用栈中的所有同步代码</li>
              <li>调用栈清空后，检查微任务队列，执行所有微任务</li>
              <li>执行一个宏任务</li>
              <li>重复步骤2和3，直到所有任务队列都为空</li>
            </ol>
            <CodeBlock code={eventLoopBasicsCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card title="宏任务与微任务">
            <Paragraph>
              <Text strong>宏任务（Macro Task）</Text>包括：script（整体代码）、setTimeout、setInterval、setImmediate、I/O、UI渲染等。
            </Paragraph>
            <Paragraph>
              <Text strong>微任务（Micro Task）</Text>包括：Promise.then/catch/finally、process.nextTick（Node.js）、MutationObserver等。
            </Paragraph>
            <Paragraph>
              微任务总是在当前宏任务执行完毕后立即执行，而下一个宏任务则要等到所有微任务执行完毕后才会执行。
            </Paragraph>
            <CodeBlock code={macroMicroTasksCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card title="复杂事件循环示例">
            <Paragraph>
              下面是一个更复杂的事件循环示例，包含嵌套的宏任务和微任务。通过分析输出顺序，可以更深入地理解事件循环机制。
            </Paragraph>
            <CodeBlock code={complexEventLoopCode} language="javascript" />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="事件循环可视化">
            <Row gutter={16}>
              <Col span={24} lg={16}>
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
                  <Col span={8}>
                    <Card title="调用栈" size="small" style={{ marginBottom: 16 }}>
                      {eventLoopState.callStack.length > 0 ? (
                        <List
                          size="small"
                          dataSource={eventLoopState.callStack}
                          renderItem={(item, index) => (
                            <List.Item>
                              <Tag color="blue">{eventLoopState.callStack.length - index}</Tag> {item}
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
                      {eventLoopState.taskQueue.length > 0 ? (
                        <List
                          size="small"
                          dataSource={eventLoopState.taskQueue}
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
                      <MessageOutlined style={{ marginRight: 8 }} /> {item}
                    </div>
                  ))}
                </Card>
              </Col>

              <Col span={24} lg={8}>
                <Card title="事件循环执行流程" size="small">
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img
                      src="https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop/the_javascript_runtime_environment_example.svg"
                      alt="事件循环示意图"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                  <Divider />
                  <Title level={5}>执行流程说明</Title>
                  <ol>
                    <li>执行全局代码（同步代码）</li>
                    <li>调用函数时，将函数推入调用栈</li>
                    <li>遇到异步API（如setTimeout）时，将回调函数放入相应的任务队列</li>
                    <li>当调用栈为空时，检查微任务队列并执行所有微任务</li>
                    <li>执行一个宏任务，然后重复步骤4</li>
                    <li>如果UI需要渲染，会在执行完一个宏任务后进行渲染</li>
                  </ol>
                </Card>

                <Card title="浏览器与Node.js的区别" size="small" style={{ marginTop: 16 }}>
                  <Paragraph>
                    浏览器和Node.js的事件循环机制有一些差异，特别是在旧版本的Node.js中。
                  </Paragraph>
                  <CodeBlock code={browserNodeDifferencesCode} language="javascript" />
                  <Paragraph>
                    <Text type="secondary">注：从Node.js v11开始，Node.js的事件循环行为已经与浏览器保持一致。</Text>
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EventLoopModule;
