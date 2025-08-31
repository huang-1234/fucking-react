import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Divider, InputNumber, Radio } from 'antd';
import CircularQueueVisualizer from './CircularQueueVisualizer';
import { CircularQueueType } from './hooks';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Group: RadioGroup } = Radio;

const CircularQueueDemo: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(8);
  const [queueType, setQueueType] = useState<CircularQueueType>(CircularQueueType.STANDARD);

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>循环队列 (Circular Queue)</Title>
          <Paragraph>
            循环队列是一种使用定长数组和头尾指针实现的高效FIFO队列。通过模运算实现环形访问，
            避免了普通队列在出队操作时的数据搬移，提高了效率。循环队列在实时数据流处理、
            嵌入式系统等资源受限环境中有广泛应用。
          </Paragraph>

          <Divider />

          <Title level={4}>核心特性</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>环形缓冲区：</Text>
                使用定长数组和模运算实现环形访问
              </li>
              <li>
                <Text strong>高效操作：</Text>
                入队和出队操作时间复杂度均为O(1)
              </li>
              <li>
                <Text strong>内存高效：</Text>
                固定大小，避免动态内存分配
              </li>
              <li>
                <Text strong>覆盖模式：</Text>
                可选择在队列已满时覆盖最旧的元素（覆盖式循环队列）
              </li>
            </ul>
          </Paragraph>

          <Divider />

          <Space style={{ marginBottom: 16 }}>
            <Text strong>设置队列容量：</Text>
            <InputNumber
              value={capacity}
              onChange={(value) => setCapacity(value || 8)}
              min={2}
              max={16}
            />

            <Text strong style={{ marginLeft: 16 }}>队列类型：</Text>
            <RadioGroup
              value={queueType}
              onChange={(e) => setQueueType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={CircularQueueType.STANDARD}>标准循环队列</Radio.Button>
              <Radio.Button value={CircularQueueType.OVERWRITING}>覆盖式循环队列</Radio.Button>
            </RadioGroup>
          </Space>
        </Card>

        <Tabs defaultActiveKey="visualizer" type="card">
          <TabPane tab="循环队列可视化" key="visualizer">
            <CircularQueueVisualizer
              capacity={capacity}
              type={queueType}
              title={queueType === CircularQueueType.STANDARD ? '标准循环队列可视化' : '覆盖式循环队列可视化'}
            />
          </TabPane>

          <TabPane tab="应用场景" key="applications">
            <Card>
              <Title level={4}>循环队列应用场景</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>1. 实时音视频流处理</Title>
                <Paragraph>
                  在音视频流处理中，循环队列常用于实现缓冲区（如WebRTC的JitterBuffer）。
                  新的音视频帧不断入队，处理程序从队列中读取帧进行处理。当网络抖动时，
                  缓冲区可以平滑播放，提高用户体验。
                </Paragraph>

                <Title level={5}>2. 嵌入式系统串口通信</Title>
                <Paragraph>
                  在嵌入式系统中，循环队列常用于实现串口接收缓冲区。
                  当串口接收到数据时，中断处理程序将数据放入循环队列；
                  主程序在适当的时候从队列中读取数据进行处理，避免数据丢失。
                </Paragraph>

                <Title level={5}>3. 滑动窗口统计</Title>
                <Paragraph>
                  在实时数据分析中，循环队列可用于实现滑动窗口，计算最近N个数据点的统计值（如平均值、最大值等）。
                  当新数据到来时，将其加入队列并移除最旧的数据，保持窗口大小固定。
                </Paragraph>

                <Title level={5}>4. 日志系统</Title>
                <Paragraph>
                  覆盖式循环队列常用于实现有限大小的日志缓冲区。当缓冲区已满时，
                  新的日志会覆盖最旧的日志，确保始终保留最新的日志记录。
                </Paragraph>

                <Title level={5}>5. 任务调度</Title>
                <Paragraph>
                  在操作系统或任务调度系统中，循环队列可用于实现轮转调度算法。
                  任务按照先来先服务的原则排队，当一个任务执行完毕后，
                  它会被移到队列尾部，等待下一次执行机会。
                </Paragraph>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="实现原理" key="implementation">
            <Card>
              <Title level={4}>循环队列实现原理</Title>
              <Paragraph>
                循环队列的核心实现基于定长数组和头尾指针，通过模运算实现环形访问。
              </Paragraph>

              <Title level={5}>1. 数据结构</Title>
              <Paragraph>
                循环队列主要包含以下组件：
                <ul>
                  <li><Text code>buffer</Text>：存储元素的定长数组</li>
                  <li><Text code>head</Text>：指向队首元素的索引</li>
                  <li><Text code>tail</Text>：指向下一个可用位置的索引</li>
                  <li><Text code>count</Text>：队列中元素的数量（可选，用于区分空队列和满队列）</li>
                </ul>
              </Paragraph>

              <Title level={5}>2. 队列操作</Title>
              <Paragraph>
                <ul>
                  <li>
                    <Text strong>入队（enqueue）</Text>：
                    <Text code>{`buffer[tail] = item; tail = (tail + 1) % capacity;`}</Text>
                  </li>
                  <li>
                    <Text strong>出队（dequeue）</Text>：
                    <Text code>{`item = buffer[head]; head = (head + 1) % capacity;`}</Text>
                  </li>
                  <li>
                    <Text strong>判断队列为空</Text>：
                    <Text code>{`isEmpty() { return count === 0; }`}</Text>
                  </li>
                  <li>
                    <Text strong>判断队列已满</Text>：
                    <Text code>{`isFull() { return count === capacity; }`}</Text>
                  </li>
                </ul>
              </Paragraph>

              <Title level={5}>3. 空队列与满队列的区分</Title>
              <Paragraph>
                在循环队列中，当<Text code>head === tail</Text>时，队列可能为空，也可能已满。
                有两种常见的解决方案：
                <ul>
                  <li>
                    <Text strong>使用计数器</Text>：
                    维护一个<Text code>count</Text>变量，记录队列中元素的数量
                  </li>
                  <li>
                    <Text strong>牺牲一个存储单元</Text>：
                    当<Text code>(tail + 1) % capacity === head</Text>时，队列已满
                  </li>
                </ul>
              </Paragraph>

              <Title level={5}>4. 覆盖式循环队列</Title>
              <Paragraph>
                覆盖式循环队列在队列已满时，允许新元素覆盖最旧的元素：
                <Text code>{`
                if (isFull()) {
                  head = (head + 1) % capacity; // 移动头指针，丢弃最旧的元素
                }
                buffer[tail] = item;
                tail = (tail + 1) % capacity;
                `}</Text>
              </Paragraph>

              <Title level={5}>5. 时间复杂度</Title>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>操作</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>时间复杂度</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>入队 (enqueue)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>直接在tail位置插入元素</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>出队 (dequeue)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>直接返回head位置元素</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>查看队首 (front)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>直接返回head位置元素</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>查看队尾 (rear)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>返回(tail-1)位置元素</td>
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

export default React.memo(CircularQueueDemo);
