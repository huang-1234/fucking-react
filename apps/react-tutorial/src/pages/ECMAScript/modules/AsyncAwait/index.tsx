import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider, Steps, Alert, Tabs } from 'antd';
import { CodeBlock } from '../../../../components/CodeBlock';
import CodePreview from '../../../../components/CodePreview';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// Async/Await基础代码
const asyncAwaitBasicsCode = `// 基本的async函数
async function fetchData() {
  try {
    // await后面可以是任何Promise
    const response = await fetch('https://api.example.com/data');

    // 等待Promise解决后继续执行
    const data = await response.json();

    console.log('获取的数据:', data);
    return data; // 返回值会被包装成Promise
  } catch (error) {
    // 捕获await过程中的任何错误
    console.error('获取数据失败:', error);
    throw error; // 重新抛出错误，使调用者可以捕获
  }
}

// 调用async函数
fetchData()
  .then(data => {
    console.log('处理返回的数据:', data);
  })
  .catch(error => {
    console.error('处理错误:', error);
  });

// 也可以使用await调用（在另一个async函数中）
async function processData() {
  try {
    const data = await fetchData();
    // 处理数据...
  } catch (error) {
    // 处理错误...
  }
}`;

// 与Promise比较代码
const comparisonCode = `// 使用Promise链
function fetchUserDataPromise(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => {
      if (!response.ok) throw new Error('用户数据获取失败');
      return response.json();
    })
    .then(user => {
      return fetch(\`/api/posts?userId=\${user.id}\`)
        .then(response => {
          if (!response.ok) throw new Error('帖子数据获取失败');
          return response.json();
        })
        .then(posts => {
          user.posts = posts;
          return user;
        });
    });
}

// 使用Async/Await
async function fetchUserDataAsync(userId) {
  // 获取用户数据
  const userResponse = await fetch(\`/api/users/\${userId}\`);
  if (!userResponse.ok) throw new Error('用户数据获取失败');
  const user = await userResponse.json();

  // 获取用户的帖子
  const postsResponse = await fetch(\`/api/posts?userId=\${user.id}\`);
  if (!postsResponse.ok) throw new Error('帖子数据获取失败');
  const posts = await postsResponse.json();

  // 组合数据
  user.posts = posts;
  return user;
}`;

// 错误处理代码
const errorHandlingCode = `// 使用try/catch处理错误
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/data');

    if (!response.ok) {
      throw new Error(\`HTTP错误: \${response.status}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发生错误:', error);

    // 可以根据错误类型进行不同处理
    if (error.name === 'TypeError') {
      console.log('网络错误或CORS问题');
    } else if (error.name === 'SyntaxError') {
      console.log('JSON解析错误');
    }

    // 可以返回默认值
    return { error: true, message: error.message };
  } finally {
    // 无论成功或失败都会执行
    console.log('请求完成');
  }
}

// 不使用try/catch，让调用者处理错误
async function fetchWithoutTryCatch() {
  const response = await fetch('https://api.example.com/data');

  if (!response.ok) {
    throw new Error(\`HTTP错误: \${response.status}\`);
  }

  return response.json();
}

// 调用者处理错误
async function caller() {
  try {
    const data = await fetchWithoutTryCatch();
    // 处理数据
  } catch (error) {
    // 处理错误
  }
}`;

// 并行执行代码
const parallelExecutionCode = `// 串行执行 - 每个请求都等待前一个完成
async function fetchSequentially() {
  console.time('sequential');

  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());

  console.timeEnd('sequential');
  return { user, posts, comments };
}

// 并行执行 - 同时发起所有请求
async function fetchParallel() {
  console.time('parallel');

  // 同时启动所有fetch请求
  const userPromise = fetch('/api/user').then(r => r.json());
  const postsPromise = fetch('/api/posts').then(r => r.json());
  const commentsPromise = fetch('/api/comments').then(r => r.json());

  // 等待所有请求完成
  const user = await userPromise;
  const posts = await postsPromise;
  const comments = await commentsPromise;

  console.timeEnd('parallel');
  return { user, posts, comments };
}

// 使用Promise.all更简洁地并行执行
async function fetchParallelWithPromiseAll() {
  console.time('promise.all');

  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);

  console.timeEnd('promise.all');
  return { user, posts, comments };
}`;

// 实用模式代码
const patternCode = `// 1. 超时处理
async function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms);
  });

  try {
    // 使用Promise.race实现超时
    const response = await Promise.race([
      fetch(url),
      timeout
    ]);

    return response.json();
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 2. 重试机制
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url).then(r => r.json());
    } catch (error) {
      console.log(\`尝试 \${i + 1} 失败，剩余重试次数: \${retries - i - 1}\`);
      lastError = error;

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// 3. 并发控制
async function fetchWithConcurrency(urls, concurrency = 2) {
  const results = [];
  const inProgress = new Set();

  // 处理单个URL的函数
  async function fetchUrl(url, index) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      results[index] = { success: true, data };
    } catch (error) {
      results[index] = { success: false, error };
    }

    inProgress.delete(index);

    // 如果还有URL待处理，继续处理
    if (nextIndex < urls.length) {
      const currentIndex = nextIndex++;
      inProgress.add(currentIndex);
      await fetchUrl(urls[currentIndex], currentIndex);
    }
  }

  // 初始化结果数组
  results.length = urls.length;

  // 开始处理，最多同时处理concurrency个URL
  let nextIndex = 0;
  const initialBatch = Math.min(concurrency, urls.length);

  // 启动初始批次
  const initialPromises = [];
  for (let i = 0; i < initialBatch; i++) {
    const currentIndex = nextIndex++;
    inProgress.add(currentIndex);
    initialPromises.push(fetchUrl(urls[currentIndex], currentIndex));
  }

  // 等待所有URL处理完成
  await Promise.all(initialPromises);

  return results;
}`;

// Async/Await原理代码
const underTheHoodCode = `// Async/Await是基于Generator和Promise的语法糖
// 下面是一个简化版的实现原理

// 1. Generator函数示例
function* generatorExample() {
  console.log('开始执行');
  const result1 = yield Promise.resolve('第一个结果');
  console.log('第一个结果:', result1);

  const result2 = yield Promise.resolve('第二个结果');
  console.log('第二个结果:', result2);

  return '完成';
}

// 2. 手动执行Generator
function runGenerator(generatorFn) {
  const generator = generatorFn();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value)
      .then(res => handle(generator.next(res)))
      .catch(err => handle(generator.throw(err)));
  }

  return handle(generator.next());
}

// 使用runGenerator执行generatorExample
runGenerator(generatorExample)
  .then(finalResult => console.log('最终结果:', finalResult))
  .catch(err => console.error('错误:', err));

// 3. 模拟async/await的实现
function asyncToGenerator(generatorFn) {
  return function() {
    const generator = generatorFn.apply(this, arguments);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = generator[key](arg);
        } catch (error) {
          return reject(error);
        }

        const { value, done } = result;

        if (done) {
          return resolve(value);
        } else {
          return Promise.resolve(value)
            .then(val => step('next', val))
            .catch(err => step('throw', err));
        }
      }

      return step('next');
    });
  };
}

// 使用asyncToGenerator实现async函数
const fetchData = asyncToGenerator(function* () {
  try {
    const response = yield fetch('https://api.example.com/data');
    const data = yield response.json();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
});

// 等同于:
// async function fetchData() {
//   try {
//     const response = await fetch('https://api.example.com/data');
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('获取数据失败:', error);
//     throw error;
//   }
// }`;

// 模拟异步操作执行步骤
const asyncSteps = [
  {
    title: '开始执行',
    description: '进入async函数',
    code: 'async function fetchData() {'
  },
  {
    title: '第一个await',
    description: '遇到第一个await表达式，暂停执行',
    code: 'const response = await fetch(url);'
  },
  {
    title: '等待Promise',
    description: '等待fetch Promise完成',
    code: '// 函数执行被暂停，等待fetch完成'
  },
  {
    title: 'Promise已完成',
    description: 'fetch Promise已完成，恢复函数执行',
    code: '// fetch完成，response现在包含结果'
  },
  {
    title: '第二个await',
    description: '遇到第二个await表达式，再次暂停执行',
    code: 'const data = await response.json();'
  },
  {
    title: '等待JSON解析',
    description: '等待response.json() Promise完成',
    code: '// 函数执行被暂停，等待JSON解析'
  },
  {
    title: 'JSON解析完成',
    description: 'JSON解析完成，恢复函数执行',
    code: '// JSON解析完成，data包含解析后的数据'
  },
  {
    title: '函数返回',
    description: '函数执行完毕，返回结果',
    code: 'return data; // 返回值会被包装成Promise'
  }
];

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
