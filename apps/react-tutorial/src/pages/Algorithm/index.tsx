import React from 'react';
import { Card, Typography, List } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const algorithmList = [
  {
    title: '最长递增子序列 (LIS)',
    description: '可视化展示动态规划和二分查找两种方法实现的最长递增子序列算法',
    path: '/algorithm/lengthoflis'
  },
  {
    title: '堆 (Heap)',
    description: '堆数据结构的可视化实现',
    path: '/algorithm/heap'
  },
  {
    title: '链表 (LinkTable)',
    description: '链表数据结构的可视化实现，支持单向链表、循环链表等各种操作',
    path: '/algorithm/linktable'
  },
  {
    title: '图 (Graph)',
    description: '图数据结构的可视化实现，支持有向图、无向图，以及BFS、DFS、拓扑排序等算法',
    path: '/algorithm/graph'
  }
];

const AlgorithmPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>算法可视化</Title>
      <Paragraph>
        这个页面包含了各种算法的可视化实现，帮助你更好地理解算法的工作原理。
      </Paragraph>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={algorithmList}
        renderItem={item => (
          <List.Item>
            <Card
              title={item.title}
              extra={<Link to={item.path}>查看</Link>}
            >
              {item.description}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AlgorithmPage;