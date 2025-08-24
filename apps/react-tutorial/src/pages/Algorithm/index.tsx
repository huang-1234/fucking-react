import React from 'react';
import { Card, Typography, List } from 'antd';
import { Link } from 'react-router-dom';
import stylesLayout from '@/layouts/container.module.less';

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
  },
  {
    title: '概率论 (Probability Theory)',
    description: '概率分布可视化和微信红包随机分配算法实现，包含红包金额分布实验',
    path: '/algorithm/probability-theory'
  },
  {
    title: '队列 (Queue)',
    description: '队列数据结构的可视化实现，支持队列的各种操作',
    path: '/algorithm/queue'
  }
];

const AlgorithmPage: React.FC = () => {
  const items = algorithmList.map(item => ({
    key: item.path,
    label: item.title,
  }));

  return (
    <div className={stylesLayout.contentLayout}>
      <Title level={2}>算法可视化</Title>
      <Paragraph>
      </Paragraph>

      {/* <Layout style={{ padding: '24px' }}>
        <Content>
          <Typography>
            <Title level={2}>算法可视化</Title>
            <Paragraph>
              本页面展示了各种算法可视化实现，包括最长递增子序列、堆、链表、图、概率论等。
            </Paragraph>
          </Typography>

          <Tabs
            defaultActiveKey="lengthoflis"
            items={items}
            tabPosition="left"
            style={{ marginTop: 20 }}
          />
        </Content>
      </Layout> */}

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