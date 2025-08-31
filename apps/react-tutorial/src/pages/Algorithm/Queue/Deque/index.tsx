import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Divider } from 'antd';
import DequeVisualizer from './DequeVisualizer';
import DequeAlgorithm from './DequeAlgorithm';
import SlidingWindowMaximum from './modules/SlidingWindowMaximum';
import LongestSubarray from './modules/LongestSubarray';
import MaxSubarraySum from './modules/MaxSubarraySum';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

const DequeDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px'  }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>双端单调队列与滑动窗口算法</Title>
          <Paragraph>
            双端单调队列是一种强大的数据结构，能够在O(1)时间复杂度内动态维护区间最值，
            是滑动窗口算法的核心优化工具。本示例展示了双端队列的基本操作以及在各种算法中的应用。
          </Paragraph>

          <Divider />

          <Title level={4}>核心特性</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>单调性维护：</Text>
                新元素入队时，从队尾弹出所有不可能成为未来最值的元素
              </li>
              <li>
                <Text strong>过期元素剔除：</Text>
                窗口移动时，从队头弹出离开窗口范围的元素
              </li>
              <li>
                <Text strong>时间复杂度优化：</Text>
                将暴力解法的O(nk)优化至O(n)
              </li>
            </ul>
          </Paragraph>
        </Card>

        <Tabs defaultActiveKey="visualizer" type="card">
          <TabPane tab="双端队列可视化" key="visualizer">
            <DequeVisualizer />
          </TabPane>

          <TabPane tab="滑动窗口算法" key="algorithm">
            <DequeAlgorithm />
          </TabPane>

          <TabPane tab="应用场景" key="applications">
            <Tabs defaultActiveKey="slidingWindow" type="card">
              <TabPane tab="滑动窗口最大值" key="slidingWindow">
                <SlidingWindowMaximum />
              </TabPane>

              <TabPane tab="绝对差不超过限制的最长子数组" key="longestSubarray">
                <LongestSubarray />
              </TabPane>

              <TabPane tab="长度受限的最大子数组和" key="maxSubarraySum">
                <MaxSubarraySum />
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default React.memo(DequeDemo);