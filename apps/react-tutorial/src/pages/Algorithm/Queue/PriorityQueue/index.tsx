import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Divider, Select } from 'antd';
import PriorityQueueVisualizer from './PriorityQueueVisualizer';
import { PriorityQueueType } from './hooks';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PriorityQueueDemo: React.FC = () => {
  const [queueType, setQueueType] = useState<PriorityQueueType>(PriorityQueueType.MIN);

  const handleQueueTypeChange = (value: PriorityQueueType) => {
    setQueueType(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>优先队列 (Priority Queue)</Title>
          <Paragraph>
            优先队列是一种特殊的队列，其中每个元素都有一个优先级，队列中的元素按照优先级顺序出队，而不是按照它们入队的顺序。
            优先队列在很多算法和应用中都有广泛的应用，例如Dijkstra算法、Prim算法、Huffman编码等。
          </Paragraph>

          <Divider />

          <Title level={4}>核心特性</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>基于堆结构：</Text>
                通常使用二叉堆（最小堆/最大堆）实现，确保队首始终为极值元素
              </li>
              <li>
                <Text strong>时间复杂度：</Text>
                入队 O(log n)，出队 O(log n)，查询极值 O(1)
              </li>
              <li>
                <Text strong>空间复杂度：</Text>
                O(n)，其中n是队列中的元素数量
              </li>
            </ul>
          </Paragraph>

          <Divider />

          <Space style={{ marginBottom: 16 }}>
            <Text strong>选择队列类型：</Text>
            <Select value={queueType} onChange={handleQueueTypeChange} style={{ width: 200 }}>
              <Option value={PriorityQueueType.MIN}>最小优先队列</Option>
              <Option value={PriorityQueueType.MAX}>最大优先队列</Option>
            </Select>
          </Space>
        </Card>

        <Tabs defaultActiveKey="visualizer" type="card">
          <TabPane tab="优先队列可视化" key="visualizer">
            <PriorityQueueVisualizer
              title={queueType === PriorityQueueType.MIN ? '最小优先队列可视化' : '最大优先队列可视化'}
              queueType={queueType}
            />
          </TabPane>

          <TabPane tab="应用场景" key="applications">
            <Card title="优先队列应用场景" style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>1. 任务调度系统</Title>
                <Paragraph>
                  操作系统进程调度（如Linux CFS）中，使用优先队列来决定哪个进程应该下一个执行。
                  优先级可以基于进程的重要性、等待时间、资源需求等因素。
                </Paragraph>

                <Title level={5}>2. 图算法优化</Title>
                <Paragraph>
                  在Dijkstra最短路径算法中，使用优先队列来选择下一个要处理的节点（距离最小的节点）。
                  在Prim最小生成树算法中，使用优先队列来选择下一条要添加的边（权重最小的边）。
                </Paragraph>

                <Title level={5}>3. 数据压缩</Title>
                <Paragraph>
                  在Huffman编码算法中，使用优先队列来构建Huffman树，频率较低的字符具有较高的优先级。
                </Paragraph>

                <Title level={5}>4. 事件驱动模拟</Title>
                <Paragraph>
                  在离散事件模拟中，使用优先队列来按照事件的发生时间顺序处理事件。
                </Paragraph>

                <Title level={5}>5. 高频交易系统</Title>
                <Paragraph>
                  在金融交易系统中，订单按照价格优先级匹配（买单最高价优先，卖单最低价优先）。
                </Paragraph>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default React.memo(PriorityQueueDemo);
