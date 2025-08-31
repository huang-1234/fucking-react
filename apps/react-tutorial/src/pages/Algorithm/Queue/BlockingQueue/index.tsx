import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Divider, InputNumber } from 'antd';
import BlockingQueueVisualizer from './BlockingQueueVisualizer';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

const BlockingQueueDemo: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(5);

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>阻塞队列 (Blocking Queue)</Title>
          <Paragraph>
            阻塞队列是一种特殊的队列，在队列为空或已满时会阻塞操作线程，常用于实现生产者-消费者模式。
            阻塞队列通过条件变量和互斥锁实现线程同步，在多线程环境中提供安全的数据交换机制。
          </Paragraph>

          <Divider />

          <Title level={4}>核心特性</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>线程同步：</Text>
                基于条件变量和互斥锁实现线程间的同步
              </li>
              <li>
                <Text strong>阻塞操作：</Text>
                当队列为空时，消费者线程会被阻塞；当队列已满时，生产者线程会被阻塞
              </li>
              <li>
                <Text strong>超时机制：</Text>
                支持带超时的入队和出队操作，避免无限等待
              </li>
              <li>
                <Text strong>非阻塞操作：</Text>
                提供非阻塞的入队（offer）和出队（poll）方法，用于无法等待的场景
              </li>
            </ul>
          </Paragraph>

          <Divider />

          <Space style={{ marginBottom: 16 }}>
            <Text strong>设置队列容量：</Text>
            <InputNumber
              value={capacity}
              onChange={(value) => setCapacity(value || 5)}
              min={1}
              max={20}
            />
          </Space>
        </Card>

        <Tabs defaultActiveKey="visualizer" type="card">
          <TabPane tab="阻塞队列可视化" key="visualizer">
            <BlockingQueueVisualizer capacity={capacity} />
          </TabPane>

          <TabPane tab="应用场景" key="applications">
            <Card>
              <Title level={4}>阻塞队列应用场景</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>1. 生产者-消费者模型</Title>
                <Paragraph>
                  在多线程应用中，阻塞队列是实现生产者-消费者模式的理想选择。生产者将数据放入队列，
                  消费者从队列中取出数据处理。当队列为空或已满时，相应的线程会自动阻塞，无需手动检查和等待。
                </Paragraph>

                <Title level={5}>2. 线程池任务缓冲</Title>
                <Paragraph>
                  线程池内部通常使用阻塞队列来存储待执行的任务。工作线程从队列中获取任务执行，
                  当没有任务时会被阻塞，避免忙等待浪费CPU资源。
                </Paragraph>

                <Title level={5}>3. 消息队列系统</Title>
                <Paragraph>
                  消息中间件（如Kafka、RabbitMQ）的核心实现通常基于阻塞队列，用于处理生产者和消费者之间的消息传递，
                  确保消息不会丢失，并支持背压（backpressure）机制。
                </Paragraph>

                <Title level={5}>4. 数据库连接池</Title>
                <Paragraph>
                  数据库连接池使用阻塞队列来管理连接请求。当没有可用连接时，请求会被阻塞，
                  直到有连接被释放或超时。
                </Paragraph>

                <Title level={5}>5. 日志收集系统</Title>
                <Paragraph>
                  日志收集系统使用阻塞队列缓冲日志事件，一个线程负责收集日志并放入队列，
                  另一个线程负责从队列取出日志并写入存储介质，避免日志生成速度与写入速度不匹配导致的问题。
                </Paragraph>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="实现比较" key="implementation">
            <Card>
              <Title level={4}>多语言实现比较</Title>
              <Paragraph>
                阻塞队列在不同编程语言中有不同的实现方式，但核心原理相似，都基于条件变量和互斥锁实现线程同步。
              </Paragraph>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>语言</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>实现方式</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>特点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Java</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <code>java.util.concurrent.BlockingQueue</code>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      提供多种实现（ArrayBlockingQueue, LinkedBlockingQueue等），支持公平锁和非公平锁
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>C++</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <code>std::mutex</code> + <code>std::condition_variable</code>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      通过标准库的互斥锁和条件变量自定义实现，支持超时等待
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Rust</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <code>std::sync::Mutex</code> + <code>std::sync::Condvar</code>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      所有权系统确保线程安全，支持超时等待
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Python</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <code>queue.Queue</code>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      内置线程安全队列，支持超时，适用于多线程环境
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>JavaScript</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      基于Promise和async/await模拟
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      由于单线程特性，只能模拟阻塞行为，通常用于异步编程
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default React.memo(BlockingQueueDemo);
