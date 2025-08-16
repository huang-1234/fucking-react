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

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

// Promise基础代码
const promiseBasicsCode = `// 创建Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  const success = true;

  if (success) {
    resolve('操作成功');  // 成功时调用resolve
  } else {
    reject('操作失败');   // 失败时调用reject
  }
});

// 使用Promise
promise
  .then(result => {
    console.log('成功:', result);  // 成功: 操作成功
    return '处理后的' + result;
  })
  .then(result => {
    console.log('链式调用:', result);  // 链式调用: 处理后的操作成功
  })
  .catch(error => {
    console.error('错误:', error);
  })
  .finally(() => {
    console.log('无论成功或失败都会执行');
  });`;

// Promise.all代码
const promiseAllCode = `// Promise.all - 所有Promise都成功时才成功
const promise1 = Promise.resolve('第一个');
const promise2 = new Promise((resolve) => {
  setTimeout(() => resolve('第二个'), 100);
});
const promise3 = Promise.resolve('第三个');

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log('所有Promise都成功了:', results);
    // 输出: 所有Promise都成功了: ['第一个', '第二个', '第三个']
  })
  .catch(error => {
    console.error('至少有一个Promise失败了:', error);
  });

// 如果有一个Promise失败
const promise4 = Promise.resolve('成功');
const promise5 = Promise.reject('失败');

Promise.all([promise4, promise5])
  .then(results => {
    console.log('这里不会执行');
  })
  .catch(error => {
    console.error('至少有一个Promise失败了:', error);
    // 输出: 至少有一个Promise失败了: 失败
  });`;

// Promise.race代码
const promiseRaceCode = `// Promise.race - 返回最先完成的Promise结果
const slow = new Promise(resolve => {
  setTimeout(() => resolve('慢速Promise'), 500);
});

const fast = new Promise(resolve => {
  setTimeout(() => resolve('快速Promise'), 100);
});

Promise.race([slow, fast])
  .then(result => {
    console.log('最快的结果:', result);
    // 输出: 最快的结果: 快速Promise
  })
  .catch(error => {
    console.error('最快的Promise失败了:', error);
  });

// 如果最快的Promise失败
const fastFail = new Promise((resolve, reject) => {
  setTimeout(() => reject('快速失败'), 50);
});

Promise.race([slow, fast, fastFail])
  .then(result => {
    console.log('这里不会执行');
  })
  .catch(error => {
    console.error('最快的Promise失败了:', error);
    // 输出: 最快的Promise失败了: 快速失败
  });`;

// Promise.allSettled代码
const promiseAllSettledCode = `// Promise.allSettled - 等待所有Promise完成，无论成功或失败
const promises = [
  Promise.resolve('成功1'),
  Promise.reject('失败'),
  Promise.resolve('成功2')
];

Promise.allSettled(promises)
  .then(results => {
    console.log('所有Promise都已完成:');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(\`Promise \${index + 1} 成功: \${result.value}\`);
      } else {
        console.log(\`Promise \${index + 1} 失败: \${result.reason}\`);
      }
    });
    /*
    输出:
    所有Promise都已完成:
    Promise 1 成功: 成功1
    Promise 2 失败: 失败
    Promise 3 成功: 成功2
    */
  });`;

// Promise.any代码
const promiseAnyCode = `// Promise.any - 返回第一个成功的Promise结果
const promises = [
  new Promise((resolve, reject) => setTimeout(() => reject('失败1'), 100)),
  new Promise((resolve, reject) => setTimeout(() => resolve('成功'), 200)),
  new Promise((resolve, reject) => setTimeout(() => reject('失败2'), 300))
];

Promise.any(promises)
  .then(result => {
    console.log('第一个成功的结果:', result);
    // 输出: 第一个成功的结果: 成功
  })
  .catch(error => {
    console.error('所有Promise都失败了:', error);
  });

// 如果所有Promise都失败
const allFail = [
  Promise.reject('失败1'),
  Promise.reject('失败2'),
  Promise.reject('失败3')
];

Promise.any(allFail)
  .then(result => {
    console.log('这里不会执行');
  })
  .catch(error => {
    console.error('所有Promise都失败了:', error);
    console.error('错误数组:', error.errors);
    // 输出: 所有Promise都失败了: AggregateError: All promises were rejected
    // 错误数组: ['失败1', '失败2', '失败3']
  });`;

// 自定义Promise实现代码
const customPromiseCode = `// 简化版Promise实现
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      } else if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    );
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('promises must be an array'));
      }

      const results = [];
      let completed = 0;

      if (promises.length === 0) {
        return resolve(results);
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completed++;

            if (completed === promises.length) {
              resolve(results);
            }
          },
          reason => reject(reason)
        );
      });
    });
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  let called = false;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;

      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}`;

// Promise实用模式代码
const promisePatternsCode = `// 1. Promise超时模式
function timeoutPromise(promise, ms) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('操作超时')), ms);
  });

  return Promise.race([promise, timeout]);
}

// 使用示例
const slowOperation = new Promise(resolve => {
  setTimeout(() => resolve('操作完成'), 2000);
});

timeoutPromise(slowOperation, 1000)
  .then(result => console.log(result))
  .catch(error => console.error(error.message)); // 输出: 操作超时

// 2. Promise重试模式
function retry(promiseFn, times = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (attemptsLeft) => {
      promiseFn()
        .then(resolve)
        .catch(error => {
          if (attemptsLeft <= 1) {
            reject(error);
          } else {
            console.log(\`重试中，剩余尝试次数: \${attemptsLeft - 1}\`);
            setTimeout(() => attempt(attemptsLeft - 1), delay);
          }
        });
    };

    attempt(times);
  });
}

// 使用示例
let counter = 0;
function unreliableOperation() {
  return new Promise((resolve, reject) => {
    counter++;
    if (counter < 3) {
      reject(new Error(\`失败次数: \${counter}\`));
    } else {
      resolve('最终成功');
    }
  });
}

retry(unreliableOperation)
  .then(result => console.log(result)) // 输出: 最终成功
  .catch(error => console.error(error.message));

// 3. Promise队列（控制并发）
function promiseQueue(promiseFns, concurrency = 2) {
  const results = [];
  let currentIndex = 0;
  let runningCount = 0;

  return new Promise((resolve) => {
    function runNext() {
      if (currentIndex >= promiseFns.length && runningCount === 0) {
        resolve(results);
        return;
      }

      while (runningCount < concurrency && currentIndex < promiseFns.length) {
        const index = currentIndex++;
        const promiseFn = promiseFns[index];
        runningCount++;

        promiseFn()
          .then(result => {
            results[index] = { status: 'fulfilled', value: result };
          })
          .catch(error => {
            results[index] = { status: 'rejected', reason: error };
          })
          .finally(() => {
            runningCount--;
            runNext();
          });
      }
    }

    runNext();
  });
}

// 使用示例
const tasks = [
  () => new Promise(r => setTimeout(() => r('任务1'), 1000)),
  () => new Promise(r => setTimeout(() => r('任务2'), 500)),
  () => new Promise((r, j) => setTimeout(() => j('任务3失败'), 800)),
  () => new Promise(r => setTimeout(() => r('任务4'), 300)),
];

promiseQueue(tasks)
  .then(results => console.log(results));`;

// Promise与Async/Await代码
const promiseAsyncAwaitCode = `// Promise链式调用
function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => {
      if (!response.ok) {
        throw new Error('用户数据获取失败');
      }
      return response.json();
    })
    .then(user => {
      return fetch(\`/api/posts?userId=\${user.id}\`);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('帖子数据获取失败');
      }
      return response.json();
    })
    .then(posts => {
      console.log('用户的帖子:', posts);
      return posts;
    })
    .catch(error => {
      console.error('获取数据失败:', error);
      throw error;
    });
}

// 使用Async/Await重写
async function fetchUserDataAsync(userId) {
  try {
    const userResponse = await fetch(\`/api/users/\${userId}\`);
    if (!userResponse.ok) {
      throw new Error('用户数据获取失败');
    }

    const user = await userResponse.json();

    const postsResponse = await fetch(\`/api/posts?userId=\${user.id}\`);
    if (!postsResponse.ok) {
      throw new Error('帖子数据获取失败');
    }

    const posts = await postsResponse.json();
    console.log('用户的帖子:', posts);
    return posts;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 并行执行多个异步操作
async function fetchMultipleResources() {
  try {
    // 并行启动多个请求
    const userPromise = fetch('/api/users').then(r => r.json());
    const postsPromise = fetch('/api/posts').then(r => r.json());
    const commentsPromise = fetch('/api/comments').then(r => r.json());

    // 等待所有请求完成
    const [users, posts, comments] = await Promise.all([
      userPromise, postsPromise, commentsPromise
    ]);

    return { users, posts, comments };
  } catch (error) {
    console.error('获取资源失败:', error);
    throw error;
  }
}`;

const PromiseModule: React.FC = () => {
  const [promiseState, setPromiseState] = useState<'pending' | 'fulfilled' | 'rejected'>('pending');
  const [promiseValue, setPromiseValue] = useState<string>('');
  const [promiseError, setPromiseError] = useState<string>('');
  const [customCode, setCustomCode] = useState<string>(
`// 测试自定义Promise
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功结果');
    // reject('失败原因');
  }, 1000);
});

promise
  .then(value => {
    console.log('成功:', value);
    return value + ' - 处理后';
  })
  .then(value => {
    console.log('链式调用:', value);
  })
  .catch(reason => {
    console.error('失败:', reason);
  });`);

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

export default PromiseModule;