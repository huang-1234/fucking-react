import React from 'react';
import { Card, Typography, List, Button } from 'antd';
import { Link } from 'react-router-dom';
import stylesLayout from '@/layouts/container.module.less';
import { useRouteListener, type RouteInfo } from '@/ahooks/sdt/router';

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
  },
  {
    title: '动态规划 (DP)',
    description: '动态规划算法可视化实现，支持打家劫舍、最长递增子序列等常见问题',
    path: '/algorithm/dp'
  },
  {
    title: '跳表 (Skip List)',
    description: '跳表数据结构的可视化实现，支持插入、删除、搜索操作的动画演示',
    path: '/algorithm/skiplist'
  },
  {
    title: '搜索 (Search)',
    description: '搜索算法可视化实现，支持深度优先搜索、广度优先搜索等常见问题',
    path: '/algorithm/search'
  }
];

const AlgorithmPage: React.FC = () => {
  const items = algorithmList.map(item => ({
    key: item.path,
    label: item.title,
  }));

  const { currentPath, searchParams, blockNavigation } = useRouteListener({
    onRouteChange: (routeInfo: RouteInfo) => {
      console.log('路由变化:', routeInfo);
    },
    watchParams: true,
    enablePreventLeave: true
  });

  return (
    <div className={stylesLayout.contentLayout}>
      <Title level={2}>算法可视化</Title>
      <Paragraph>
        当前路径: {currentPath}
        查询参数: {searchParams.toString()}
        <Button onClick={() => blockNavigation(true)}>启用离开阻止</Button>
        <Button onClick={() => blockNavigation(false)}>禁用离开阻止</Button>
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