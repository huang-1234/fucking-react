import React from 'react';
import { Tabs, Card, Typography, Space, Divider, List } from 'antd';
import { Link } from 'react-router-dom';
import {
  OrderedListOutlined,
  ClockCircleOutlined,
  LockOutlined,
  SyncOutlined
} from '@ant-design/icons';
import PriorityQueue from './PriorityQueue';
import BlockingQueue from './BlockingQueue';
import DelayQueue from './DelayQueue';
import CircularQueue from './CircularQueue';
import Deque from './Deque';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

/**
 * 队列类型定义
 */
interface QueueType {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  features: string[];
  applications: string[];
  component?: React.ReactNode;
}

/**
 * 队列类型数据
 */
const queueTypes: QueueType[] = [
  // 双端队列可视化
  {
    key: 'deque',
    title: '双端队列 (Deque)',
    icon: <OrderedListOutlined />,
    description: '基于数组实现的双端队列',
    path: '/algorithm/queue/deque',
    component: <Deque />,
    features: [
      '基于数组实现的双端队列',
      '支持在队列两端进行插入和删除操作',
      '支持在队列两端进行插入和删除操作',
    ],
    applications: [
      '滑动窗口',
      '单调队列',
      '单调栈',
      '双端队列',
      // 常用算法
      '滑动窗口最大值',
      '滑动窗口最小值',
      '滑动窗口中位数',
      '滑动窗口最大值',
      '滑动窗口最小值',
      '滑动窗口中位数',
    ]
  },
  {
    key: 'priority-queue',
    title: '优先队列 (Priority Queue)',
    icon: <OrderedListOutlined />,
    description: '基于堆结构实现，元素按优先级排序而非入队顺序',
    path: '/algorithm/queue/priority-queue',
    component: <PriorityQueue />,
    features: [
      '基于二叉堆（最小堆/最大堆）实现',
      '入队 O(log n)，出队 O(log n)，查询极值 O(1)',
      '支持动态调整元素优先级'
    ],
    applications: [
      '任务调度系统',
      'Dijkstra最短路径算法',
      'Huffman编码',
      '高频交易系统'
    ]
  },
  {
    key: 'blocking-queue',
    title: '阻塞队列 (Blocking Queue)',
    icon: <LockOutlined />,
    description: '支持线程同步的队列，在队列为空或已满时阻塞操作线程',
    path: '/algorithm/queue/blocking-queue',
    component: <BlockingQueue />,
    features: [
      '基于条件变量和互斥锁实现线程同步',
      '支持超时机制避免无限等待',
      '提供非阻塞操作方法（offer/poll）'
    ],
    applications: [
      '生产者-消费者模型',
      '线程池任务缓冲',
      '数据库连接池'
    ]
  },
  {
    key: 'delay-queue',
    title: '延迟队列 (Delay Queue)',
    icon: <ClockCircleOutlined />,
    description: '元素在指定的延迟时间后才可被消费',
    path: '/algorithm/queue/delay-queue',
    component: <DelayQueue />,
    features: [
      '基于优先队列实现，按到期时间排序',
      '支持定时任务调度',
      '提供异步等待机制'
    ],
    applications: [
      '定时任务调度系统',
      '电商订单超时取消',
      '缓存过期策略',
      '限流算法'
    ]
  },
  {
    key: 'circular-queue',
    title: '循环队列 (Circular Queue)',
    icon: <SyncOutlined />,
    description: '使用定长数组和头尾指针实现的高效FIFO队列',
    path: '/algorithm/queue/circular-queue',
    component: <CircularQueue />,
    features: [
      '固定大小，内存使用高效',
      '入队/出队时间复杂度 O(1)',
      '支持覆盖式写入（可选）'
    ],
    applications: [
      '实时音视频流缓冲',
      '嵌入式系统串口通信',
      '滑动窗口统计',
      '实时数据流处理'
    ]
  }
];

/**
 * 队列算法模块主页
 */
const QueueAlgorithms: React.FC = () => {
  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>队列变种算法</Title>
          <Paragraph>
            队列是一种基本的数据结构，遵循先进先出（FIFO）原则。然而，在实际应用中，
            标准队列的功能往往不足以满足复杂场景的需求。本模块实现了四种常用的队列变种，
            每种都针对特定的应用场景进行了优化。
          </Paragraph>

          <Divider />

          <Title level={4}>队列变种概览</Title>
          <Tabs type="card" tabPosition="left" style={{ width: '100%' }}>
            {queueTypes.map(item => (
              <TabPane tab={item.title} key={item.key}>
                {item.component}
              </TabPane>
            ))}
          </Tabs>
        </Card>

        <Tabs defaultActiveKey="overview" type="card">
          <TabPane tab="实现对比" key="overview">
            <Card>
              <Title level={4}>队列变种实现对比</Title>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>特性</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>优先队列</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>阻塞队列</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>延迟队列</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>循环队列</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>底层数据结构</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>二叉堆</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>数组/链表</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>优先队列</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>定长数组</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>出队顺序</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>按优先级</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>FIFO</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>按到期时间</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>FIFO</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>入队时间复杂度</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>出队时间复杂度</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(log n)</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>O(1)</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>线程安全</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>否（默认）</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>是</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>是</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>否（默认）</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>阻塞操作</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>否</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>是</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>是</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>否</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>内存使用</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>动态增长</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>可限制大小</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>动态增长</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>固定大小</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabPane>

          <TabPane tab="实现语言" key="languages">
            <Card>
              <Title level={4}>多语言实现</Title>
              <Paragraph>
                本模块中的队列变种算法提供了TypeScript、C++和Rust三种语言的实现，
                便于在不同环境中使用和学习比较。
              </Paragraph>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>队列类型</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>TypeScript</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>C++</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Rust</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>优先队列</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>阻塞队列</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>延迟队列</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>循环队列</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>✅</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </>
  );
};

export default React.memo(QueueAlgorithms);