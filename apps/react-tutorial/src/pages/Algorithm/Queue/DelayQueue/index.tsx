import React from 'react';
import { Tabs, Card, Typography, Space, Divider } from 'antd';
import DelayQueueVisualizer from './DelayQueueVisualizer';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

const DelayQueueDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>延迟队列 (Delay Queue)</Title>
          <Paragraph>
            延迟队列是一种特殊的队列，其中的元素只有在其指定的延迟时间到期后才可被消费。
            延迟队列通常基于优先队列实现，按照元素的到期时间排序，用于定时任务调度、缓存过期策略等场景。
          </Paragraph>

          <Divider />

          <Title level={4}>核心特性</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>时间堆（Timer Heap）：</Text>
                按到期时间排序的最小堆，堆顶为最近到期项
              </li>
              <li>
                <Text strong>延迟消费：</Text>
                元素只有在其指定的延迟时间到期后才可被消费
              </li>
              <li>
                <Text strong>定时器机制：</Text>
                内部维护定时器，在元素到期时触发回调或唤醒等待线程
              </li>
              <li>
                <Text strong>阻塞/非阻塞操作：</Text>
                支持阻塞获取（take）和非阻塞轮询（poll）
              </li>
            </ul>
          </Paragraph>
        </Card>

        <Tabs defaultActiveKey="visualizer" type="card">
          <TabPane tab="延迟队列可视化" key="visualizer">
            <DelayQueueVisualizer />
          </TabPane>

          <TabPane tab="应用场景" key="applications">
            <Card>
              <Title level={4}>延迟队列应用场景</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>1. 定时任务调度</Title>
                <Paragraph>
                  延迟队列是实现定时任务调度系统的理想选择，如Quartz、Cron等分布式任务触发器。
                  任务按照执行时间排序，系统只需从队列头部获取到期任务执行，无需频繁轮询所有任务。
                </Paragraph>

                <Title level={5}>2. 电商订单超时处理</Title>
                <Paragraph>
                  电商系统中，未支付订单需要在一定时间后自动取消。可以将订单放入延迟队列，
                  设置30分钟后到期，到期后自动执行取消逻辑，释放库存。
                </Paragraph>

                <Title level={5}>3. 缓存过期策略</Title>
                <Paragraph>
                  实现基于时间的缓存过期策略时，可以使用延迟队列跟踪缓存项的过期时间。
                  当缓存项到期时，从缓存中删除对应的数据，避免内存泄漏。
                </Paragraph>

                <Title level={5}>4. 限流算法</Title>
                <Paragraph>
                  令牌桶限流算法中，可以使用延迟队列实现令牌的定时生成。
                  每个令牌在特定时间后到期，到期后添加到令牌桶中，控制请求速率。
                </Paragraph>

                <Title level={5}>5. 物联网设备心跳检测</Title>
                <Paragraph>
                  在物联网系统中，可以使用延迟队列检测设备离线状态。
                  每次收到设备心跳，就更新其在延迟队列中的到期时间；
                  如果设备心跳超时（延迟队列中的项到期），则判定设备离线。
                </Paragraph>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="实现原理" key="implementation">
            <Card>
              <Title level={4}>延迟队列实现原理</Title>
              <Paragraph>
                延迟队列的核心实现基于优先队列（最小堆）和定时器机制，主要包含以下组件：
              </Paragraph>

              <Title level={5}>1. 优先队列（最小堆）</Title>
              <Paragraph>
                延迟队列内部使用优先队列存储元素，按照元素的到期时间排序。
                这确保了队列头部始终是最早到期的元素，获取下一个到期元素的时间复杂度为O(1)。
              </Paragraph>

              <Title level={5}>2. 定时器管理</Title>
              <Paragraph>
                延迟队列维护一个定时器，在最早到期的元素到期时触发。
                当添加或移除元素时，会重新计算下一个到期时间，并调整定时器。
              </Paragraph>

              <Title level={5}>3. 懒惰删除</Title>
              <Paragraph>
                延迟队列通常采用懒惰删除策略，只在需要时（如出队操作）检查元素是否到期。
                这避免了频繁的定时器操作，提高了效率。
              </Paragraph>

              <Title level={5}>4. 线程安全</Title>
              <Paragraph>
                在多线程环境中，延迟队列需要确保线程安全，通常通过锁和条件变量实现。
                阻塞操作（如take）会使线程等待，直到有元素到期或被中断。
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
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>添加元素 (add)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>优先队列插入操作</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>轮询元素 (poll)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>优先队列删除操作</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>查看队首 (peek)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>优先队列查看堆顶元素</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>阻塞获取 (take)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>可能包含等待时间</td>
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

export default React.memo(DelayQueueDemo);
