import React, { Suspense, useState, lazy } from 'react';
import { Card, Typography, Row, Col, Tabs, Space } from 'antd';
import {
  NodeIndexOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  ClusterOutlined
} from '@ant-design/icons';
import { renderReactNode } from '@/utils/react';

// Lazy load components for better performance
const DFSVisualizer = lazy(() => import('./DFS/DFSVisualizer'));
const BFSVisualizer = lazy(() => import('./BFS/BFSVisualizer'));
const BacktrackingVisualizer = lazy(() => import('./Backtracking/BacktrackingVisualizer'));
const AlgorithmComparison = lazy(() => import('./Comparison/AlgorithmComparison'));

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface SearchType {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  applications: string[];
  component?: React.ReactNode;
}

const SearchAlgorithmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dfs');

  const searchTypes: SearchType[] = [
    {
      key: 'dfs',
      title: '深度优先搜索 (DFS)',
      icon: <NodeIndexOutlined />,
      description: '深度优先搜索是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入地探索，直到无法继续前进时回溯到上一个分叉点，然后继续探索其他路径。',
      features: [
        '使用栈（递归或显式）作为辅助数据结构',
        '空间复杂度为 O(h)，其中 h 是图的深度',
        '适用于连通性检测、路径存在性判断、拓扑排序等问题'
      ],
      applications: [
        '拓扑排序',
        '连通分量识别',
        '路径查找',
        '迷宫生成与求解',
        '岛屿计数问题'
      ],
      component: <Suspense fallback={<div>Loading...</div>}>
        <DFSVisualizer />
      </Suspense>
    },
    {
      key: 'bfs',
      title: '广度优先搜索 (BFS)',
      icon: <BranchesOutlined />,
      description: '广度优先搜索是一种用于遍历或搜索树或图的算法。它从根节点开始，先访问所有相邻节点，然后再访问下一层节点，按层级顺序逐步扩展。',
      features: [
        '使用队列（先进先出）作为辅助数据结构',
        '保证找到的路径是最短路径（在无权图中）',
        '适合解决最短路径、层级遍历等问题'
      ],
      applications: [
        '最短路径查找',
        '层级遍历',
        '连通分量识别',
        '网络爬虫',
        '单词接龙问题'
      ],
      component: <Suspense fallback={<div>Loading...</div>}>
        <BFSVisualizer />
      </Suspense>
    },
    {
      key: 'backtracking',
      title: '回溯算法',
      icon: <ApartmentOutlined />,
      description: '回溯算法是一种通过探索所有可能的解决方案来找到所有解（或特定解）的算法。它采用试错的思想，尝试分步解决问题，当发现当前方案不是正确的解时，回溯到上一步，尝试其他可能的分支。',
      features: [
        '使用递归实现，通过系统栈保存状态',
        '适用于组合问题、排列问题、子集问题等',
        '通过剪枝优化搜索空间'
      ],
      applications: [
        'N皇后问题',
        '数独求解',
        '全排列问题',
        '组合问题',
        '子集问题'
      ],
      component: <Suspense fallback={<div>Loading...</div>}>
        <BacktrackingVisualizer />
      </Suspense>
    },
    {
      key: 'comparison',
      title: '算法比较',
      icon: <ClusterOutlined />,
      description: '比较深度优先搜索、广度优先搜索和回溯算法的异同，了解它们各自的优缺点和适用场景。',
      features: [
        'DFS vs BFS 空间和时间复杂度比较',
        '不同问题类型的最佳算法选择',
        '实际应用中的性能对比'
      ],
      applications: [
        '算法选型决策',
        '性能优化',
        '问题建模'
      ],
      component: <Suspense fallback={<div>Loading...</div>}>
        <AlgorithmComparison />
      </Suspense>
    }
  ];

  const renderAlgorithmCards = () => {
    return (
      <Row gutter={[16, 16]}>
        {searchTypes.map(type => (
          <Col xs={24} sm={12} md={8} lg={6} key={type.key}>
            <Card
              hoverable
              onClick={() => setActiveTab(type.key)}
              style={{
                height: '100%',
                borderColor: activeTab === type.key ? '#1890ff' : undefined,
                boxShadow: activeTab === type.key ? '0 0 8px rgba(24, 144, 255, 0.5)' : undefined
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: '24px', color: '#1890ff', textAlign: 'center' }}>
                  {type.icon}
                </div>
                <Title level={4} style={{ textAlign: 'center', margin: '8px 0' }}>
                  {type.title}
                </Title>
                <Paragraph ellipsis={{ rows: 3 }} style={{ textAlign: 'center' }}>
                  {type.description}
                </Paragraph>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>搜索算法可视化</Title>
          <Paragraph>
            搜索算法是计算机科学中的基础算法，用于在数据结构中查找特定元素或路径。
            本模块提供了深度优先搜索 (DFS)、广度优先搜索 (BFS) 和回溯算法的可视化演示，
            帮助你理解这些算法的工作原理和应用场景。
          </Paragraph>

          {renderAlgorithmCards()}
        </Card>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {searchTypes.map(type => (
              <TabPane tab={type.title} key={type.key}>
                {renderReactNode(type.component)}
              </TabPane>
            ))}
          </Tabs>
        </Card>
      </Space>
    </div>
  );
};

export default React.memo(SearchAlgorithmsPage);