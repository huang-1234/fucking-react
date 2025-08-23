import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Select, message, Typography, Space, Divider, Slider, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import { Graph } from '@fucking-algorithm/algorithm/graph/graph.ts';
import type { GraphData, NodeId, GraphNode, GraphEdge, AlgorithmStep, AlgorithmType, NodeStatus, EdgeStatus } from './types';
import { visDataToGraph, generateRandomGraph, runTopologicalSort, runBFS, runDFS } from './graphUtils';
import './Graph.less';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 图可视化组件
function GraphVisualization() {
  // 图数据状态
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
    isDirected: false
  });

  // 图实例
  const [graph, setGraph] = useState<Graph<NodeId>>(new Graph<NodeId>(false));

  // 节点和边的状态
  const [nodeStatus, setNodeStatus] = useState<Map<NodeId, NodeStatus>>(new Map());
  const [edgeStatus, setEdgeStatus] = useState<Map<string, EdgeStatus>>(new Map());

  // 操作相关状态
  const [sourceNode, setSourceNode] = useState<string>('');
  const [targetNode, setTargetNode] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [nodeValue, setNodeValue] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [isWeighted, setIsWeighted] = useState<boolean>(false);

  // 算法可视化状态
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('bfs');
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [startNode, setStartNode] = useState<string>('');
  const [operationLog, setOperationLog] = useState<string[]>([]);

  // SVG引用
  const svgRef = useRef<SVGSVGElement>(null);

  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 添加操作日志
  const addLog = (log: string) => {
    setOperationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // 初始化图
  useEffect(() => {
    createRandomGraph();
  }, []);

  // 算法自动播放
  useEffect(() => {
    if (isPlaying && currentStepIndex < algorithmSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 2000 / playSpeed);
    } else if (currentStepIndex >= algorithmSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, algorithmSteps, playSpeed]);

  // 当前步骤变化时更新状态
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < algorithmSteps.length) {
      updateVisualizationState(currentStepIndex);
    }
  }, [currentStepIndex, algorithmSteps]);

  // 更新可视化状态
  const updateVisualizationState = (stepIndex: number) => {
    const newNodeStatus = new Map<NodeId, NodeStatus>();
    const newEdgeStatus = new Map<string, EdgeStatus>();

    // 处理之前的步骤
    for (let i = 0;i <= stepIndex;i++) {
      const step = algorithmSteps[i];

      switch (step.type) {
        case 'visit':
          if (step.nodeId) {
            newNodeStatus.set(step.nodeId, 'visited');
          }
          break;
        case 'process':
          if (step.nodeId) {
            newNodeStatus.set(step.nodeId, 'processing');
          }
          break;
        case 'complete':
          if (step.nodeId) {
            newNodeStatus.set(step.nodeId, 'completed');
          }
          break;
        case 'edge':
          if (step.edgeSource && step.edgeTarget) {
            const edgeId = `${step.edgeSource}-${step.edgeTarget}`;
            newEdgeStatus.set(edgeId, 'visited');
          }
          break;
        case 'queue':
        case 'stack':
          if (step.nodeId) {
            if (!newNodeStatus.has(step.nodeId)) {
              newNodeStatus.set(step.nodeId, 'active');
            }
          }
          break;
      }
    }

    setNodeStatus(newNodeStatus);
    setEdgeStatus(newEdgeStatus);
  };

  // 创建随机图
  const createRandomGraph = () => {
    const nodeCount = Math.floor(Math.random() * 5) + 5; // 5-10个节点
    const data = generateRandomGraph(nodeCount, 0.3, isDirected, isWeighted);
    setGraphData(data);
    setGraph(visDataToGraph(data));
    resetAlgorithm();
    addLog(`创建了一个随机${isDirected ? '有向' : '无向'}图，包含 ${nodeCount} 个节点`);
  };

  // 添加节点
  const handleAddNode = () => {
    if (!nodeValue) {
      message.error('请输入节点值');
      return;
    }

    const nodeId = Number.isNaN(Number(nodeValue)) ? nodeValue : Number(nodeValue);

    // 检查节点是否已存在
    if (graphData.nodes.some(node => node.id === nodeId)) {
      message.error('节点已存在');
      return;
    }

    // 计算新节点位置
    const angle = (graphData.nodes.length / (graphData.nodes.length + 1)) * 2 * Math.PI;
    const radius = 150;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    const newNode: GraphNode = {
      id: nodeId,
      label: String(nodeId),
      x,
      y
    };

    const newGraphData = {
      ...graphData,
      nodes: [...graphData.nodes, newNode]
    };

    setGraphData(newGraphData);
    const newGraph = visDataToGraph(newGraphData);
    setGraph(newGraph);
    resetAlgorithm();
    setNodeValue('');
    addLog(`添加节点: ${nodeId}`);
  };

  // 添加边
  const handleAddEdge = () => {
    if (!sourceNode || !targetNode) {
      message.error('请选择源节点和目标节点');
      return;
    }

    const source = Number.isNaN(Number(sourceNode)) ? sourceNode : Number(sourceNode);
    const target = Number.isNaN(Number(targetNode)) ? targetNode : Number(targetNode);

    // 检查节点是否存在
    if (!graphData.nodes.some(node => node.id === source)) {
      message.error(`源节点 ${source} 不存在`);
      return;
    }

    if (!graphData.nodes.some(node => node.id === target)) {
      message.error(`目标节点 ${target} 不存在`);
      return;
    }

    // 检查边是否已存在
    if (graphData.edges.some(edge => edge.source === source && edge.target === target)) {
      message.error('边已存在');
      return;
    }

    const weightValue = weight ? Number(weight) : undefined;

    const newEdge: GraphEdge = {
      source,
      target,
      weight: weightValue,
      id: `${source}-${target}`
    };

    const newGraphData = {
      ...graphData,
      edges: [...graphData.edges, newEdge]
    };

    setGraphData(newGraphData);
    const newGraph = visDataToGraph(newGraphData);
    setGraph(newGraph);
    resetAlgorithm();
    setSourceNode('');
    setTargetNode('');
    setWeight('');
    addLog(`添加边: ${source} -> ${target}${weightValue ? ` (权重: ${weightValue})` : ''}`);
  };

  // 删除节点
  const handleDeleteNode = () => {
    if (selectedNode === null) {
      message.error('请先选择一个节点');
      return;
    }

    const newNodes = graphData.nodes.filter(node => node.id !== selectedNode);
    const newEdges = graphData.edges.filter(
      edge => edge.source !== selectedNode && edge.target !== selectedNode
    );

    const newGraphData = {
      ...graphData,
      nodes: newNodes,
      edges: newEdges
    };

    setGraphData(newGraphData);
    const newGraph = visDataToGraph(newGraphData);
    setGraph(newGraph);
    resetAlgorithm();
    setSelectedNode(null);
    addLog(`删除节点: ${selectedNode}`);
  };

  // 切换图类型（有向/无向）
  const handleToggleDirected = (checked: boolean) => {
    setIsDirected(checked);
    const newGraphData = {
      ...graphData,
      isDirected: checked
    };
    setGraphData(newGraphData);
    const newGraph = visDataToGraph(newGraphData);
    setGraph(newGraph);
    resetAlgorithm();
    addLog(`切换为${checked ? '有向' : '无向'}图`);
  };

  // 切换权重
  const handleToggleWeighted = (checked: boolean) => {
    setIsWeighted(checked);
    addLog(`${checked ? '启用' : '禁用'}边权重`);
  };

  // 选择节点
  const handleNodeClick = (nodeId: NodeId) => {
    setSelectedNode(nodeId);
    addLog(`选择节点: ${nodeId}`);
  };

  // 运行算法
  const handleRunAlgorithm = () => {
    if (graphData.nodes.length === 0) {
      message.error('请先创建图');
      return;
    }

    let steps: AlgorithmStep[] = [];
    let startNodeValue: NodeId;

    if (algorithmType === 'topological-sort') {
      if (!graphData.isDirected) {
        message.error('拓扑排序只适用于有向图');
        return;
      }
      steps = runTopologicalSort(graph);
      addLog('开始执行拓扑排序算法');
    } else {
      if (!startNode) {
        message.error('请选择起始节点');
        return;
      }

      startNodeValue = Number.isNaN(Number(startNode)) ? startNode : Number(startNode);

      if (!graphData.nodes.some(node => node.id === startNodeValue)) {
        message.error(`节点 ${startNodeValue} 不存在`);
        return;
      }

      if (algorithmType === 'bfs') {
        steps = runBFS(graph, startNodeValue);
        addLog(`开始执行广度优先搜索 (BFS)，起始节点: ${startNodeValue}`);
      } else if (algorithmType === 'dfs') {
        steps = runDFS(graph, startNodeValue);
        addLog(`开始执行深度优先搜索 (DFS)，起始节点: ${startNodeValue}`);
      }
    }

    setAlgorithmSteps(steps);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  // 重置算法
  const resetAlgorithm = () => {
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setNodeStatus(new Map());
    setEdgeStatus(new Map());
  };

  // 播放/暂停算法
  const togglePlay = () => {
    if (algorithmSteps.length === 0) {
      message.info('请先运行算法');
      return;
    }

    if (currentStepIndex >= algorithmSteps.length - 1) {
      setCurrentStepIndex(0);
    }

    setIsPlaying(!isPlaying);
  };

  // 单步执行
  const stepForward = () => {
    if (algorithmSteps.length === 0) {
      message.info('请先运行算法');
      return;
    }

    if (currentStepIndex < algorithmSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // 渲染节点
  const renderNodes = () => {
    return graphData.nodes.map(node => {
      const status = nodeStatus.get(node.id) || 'default';

      return (
        <g key={node.id} onClick={() => handleNodeClick(node.id)}>
          <circle
            cx={node.x}
            cy={node.y}
            r={20}
            className={`node ${status}`}
            fill={status === 'default' ? '#1890ff' : undefined}
          />
          <text
            x={node.x}
            y={node.y}
            className="node-label"
          >
            {node.label}
          </text>
        </g>
      );
    });
  };

  // 渲染边
  const renderEdges = () => {
    return graphData.edges.map(edge => {
      const source = graphData.nodes.find(node => node.id === edge.source);
      const target = graphData.nodes.find(node => node.id === edge.target);

      if (!source || !target) return null;

      const status = edgeStatus.get(`${edge.source}-${edge.target}`) || 'default';

      // 计算边的路径
      const dx = target.x! - source.x!;
      const dy = target.y! - source.y!;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 调整起点和终点，避免与节点重叠
      const nodeRadius = 20;
      const ratio = nodeRadius / distance;

      const startX = source.x! + dx * ratio;
      const startY = source.y! + dy * ratio;
      const endX = target.x! - dx * ratio;
      const endY = target.y! - dy * ratio;

      // 计算权重文本位置
      const textX = (startX + endX) / 2;
      const textY = (startY + endY) / 2 - 5;

      // 计算箭头
      const arrowSize = 10;
      const angle = Math.atan2(dy, dx);

      const arrowX1 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
      const arrowY1 = endY - arrowSize * Math.sin(angle - Math.PI / 6);
      const arrowX2 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
      const arrowY2 = endY - arrowSize * Math.sin(angle + Math.PI / 6);

      return (
        <g key={`${edge.source}-${edge.target}`}>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            className={`edge ${status}`}
          />

          {graphData.isDirected && (
            <polygon
              points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
              className={`edge-arrow ${status}`}
            />
          )}

          {edge.weight !== undefined && (
            <text
              x={textX}
              y={textY}
              className="edge-weight"
            >
              {edge.weight}
            </text>
          )}
        </g>
      );
    });
  };

  // 获取当前步骤信息
  const getCurrentStepInfo = () => {
    if (currentStepIndex < 0 || currentStepIndex >= algorithmSteps.length) {
      return '等待算法执行...';
    }

    const step = algorithmSteps[currentStepIndex];
    return step.message || '';
  };

  return (
    <div className="graph-container">
      <Title level={2}>图数据结构可视化</Title>

      <Card title="图配置" style={{ marginBottom: 20 }}>
        <Space wrap>
          <div className="input-group">
            <Switch
              checked={isDirected}
              onChange={handleToggleDirected}
              checkedChildren="有向图"
              unCheckedChildren="无向图"
            />
          </div>

          <div className="input-group">
            <Switch
              checked={isWeighted}
              onChange={handleToggleWeighted}
              checkedChildren="带权重"
              unCheckedChildren="无权重"
            />
          </div>

          <Button type="primary" onClick={createRandomGraph}>
            生成随机图
          </Button>
        </Space>
      </Card>


      <Card title="图操作" style={{ marginBottom: 20 }}>
        <div className="operations-container">
          <div className="operation-group">
            <div className="group-title">节点操作</div>
            <div className="group-content">
              <div className="input-group">
                <Text className="input-label">节点值：</Text>
                <Input
                  className="input-field"
                  placeholder="节点ID"
                  value={nodeValue}
                  onChange={e => setNodeValue(e.target.value)}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNode}
                >
                  添加节点
                </Button>
              </div>

              <div className="input-group">
                <Text className="input-label">选中节点：</Text>
                <Text>{selectedNode !== null ? String(selectedNode) : '无'}</Text>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteNode}
                  disabled={selectedNode === null}
                >
                  删除节点
                </Button>
              </div>
            </div>
          </div>

          <Divider />

          <div className="operation-group">
            <div className="group-title">边操作</div>
            <div className="group-content">
              <div className="input-group">
                <Text className="input-label">源节点：</Text>
                <Select
                  className="input-field"
                  placeholder="选择源节点"
                  value={sourceNode || undefined}
                  onChange={value => setSourceNode(value)}
                  style={{ width: 120 }}
                >
                  {graphData.nodes.map(node => (
                    <Option key={String(node.id)} value={String(node.id)}>
                      {node.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="input-group">
                <Text className="input-label">目标节点：</Text>
                <Select
                  className="input-field"
                  placeholder="选择目标节点"
                  value={targetNode || undefined}
                  onChange={value => setTargetNode(value)}
                  style={{ width: 120 }}
                >
                  {graphData.nodes.map(node => (
                    <Option key={String(node.id)} value={String(node.id)}>
                      {node.label}
                    </Option>
                  ))}
                </Select>
              </div>

              {isWeighted && (
                <div className="input-group">
                  <Text className="input-label">权重：</Text>
                  <Input
                    className="input-field"
                    placeholder="边权重"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              )}

              <Button
                type="primary"
                onClick={handleAddEdge}
              >
                添加边
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="算法可视化" style={{ marginBottom: 20 }}>
        <div className="operations-container">
          <div className="operation-group">
            <div className="group-content">
              <div className="input-group">
                <Text className="input-label">算法：</Text>
                <Select
                  value={algorithmType}
                  onChange={value => {
                    setAlgorithmType(value);
                    resetAlgorithm();
                  }}
                  style={{ width: 150 }}
                >
                  <Option value="bfs">广度优先搜索 (BFS)</Option>
                  <Option value="dfs">深度优先搜索 (DFS)</Option>
                  <Option value="topological-sort">拓扑排序</Option>
                </Select>
              </div>

              {(algorithmType === 'bfs' || algorithmType === 'dfs') && (
                <div className="input-group">
                  <Text className="input-label">起始节点：</Text>
                  <Select
                    placeholder="选择起始节点"
                    value={startNode || undefined}
                    onChange={value => setStartNode(value)}
                    style={{ width: 120 }}
                  >
                    {graphData.nodes.map(node => (
                      <Option key={String(node.id)} value={String(node.id)}>
                        {node.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              )}

              <Button
                type="primary"
                onClick={handleRunAlgorithm}
              >
                运行算法
              </Button>
            </div>
          </div>

          <Divider />

          <div className="algorithm-controls">
            <Button
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
              disabled={algorithmSteps.length === 0}
            >
              {isPlaying ? '暂停' : '播放'}
            </Button>

            <Button
              icon={<StepForwardOutlined />}
              onClick={stepForward}
              disabled={algorithmSteps.length === 0 || currentStepIndex >= algorithmSteps.length - 1}
            >
              下一步
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => resetAlgorithm()}
              disabled={algorithmSteps.length === 0}
            >
              重置
            </Button>

            <Text style={{ margin: '0 10px' }}>速度:</Text>
            <Slider
              min={0.5}
              max={3}
              step={0.5}
              value={playSpeed}
              onChange={value => setPlaySpeed(value)}
              className="speed-slider"
            />
          </div>
        </div>

        <div className="status-container">
          <div className="status-title">算法步骤</div>
          <div className="status-content">
            {getCurrentStepInfo()}
          </div>
        </div>
      </Card>

      <Card title="图可视化" style={{ marginBottom: 20 }} >
        <div className="visualization-container">
          <svg ref={svgRef} className="graph-svg" viewBox="-200 -200 400 400">
            <g>
              {renderEdges()}
              {renderNodes()}
            </g>
          </svg>
        </div>
      </Card>

      <Card title="操作日志">
        <div className="status-container">
          <div className="status-content">
            {operationLog.length === 0 ? (
              <Text type="secondary">暂无操作记录</Text>
            ) : (
              operationLog.map((log, index) => (
                <div key={index} className="step-item">{log}</div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card title="图数据结构知识" style={{ marginTop: 20 }}>
        <div className="algorithm-info">
          <Paragraph>
            <strong>图</strong>是一种非线性数据结构，由顶点（节点）和边组成。图可以用来表示各种复杂的关系和网络。
          </Paragraph>

          <Title level={4}>图的类型</Title>
          <ul>
            <li><strong>有向图</strong>：边有方向，从一个顶点指向另一个顶点</li>
            <li><strong>无向图</strong>：边没有方向，表示两个顶点之间的双向连接</li>
            <li><strong>带权图</strong>：边具有权重值，表示两个顶点之间的距离、成本等</li>
            <li><strong>连通图</strong>：任意两个顶点之间都存在路径</li>
            <li><strong>完全图</strong>：任意两个顶点之间都有边相连</li>
          </ul>

          <Title level={4}>图的表示方法</Title>
          <ul>
            <li><strong>邻接矩阵</strong>：使用二维数组表示顶点之间的连接关系，空间复杂度O(V²)</li>
            <li><strong>邻接表</strong>：每个顶点维护一个链表，存储与其相邻的顶点，空间复杂度O(V+E)</li>
          </ul>

          <Title level={4}>常见图算法</Title>
          <ul>
            <li><strong>广度优先搜索 (BFS)</strong>：按层次遍历图，适用于寻找最短路径</li>
            <li><strong>深度优先搜索 (DFS)</strong>：尽可能深地搜索图的分支，适用于检测环、拓扑排序等</li>
            <li><strong>拓扑排序</strong>：对有向无环图的顶点进行排序，使得所有的有向边都从排在前面的顶点指向排在后面的顶点</li>
            <li><strong>Dijkstra算法</strong>：寻找单源最短路径</li>
            <li><strong>Bellman-Ford算法</strong>：寻找单源最短路径，可处理负权边</li>
            <li><strong>Kruskal算法</strong>：寻找最小生成树</li>
            <li><strong>Prim算法</strong>：寻找最小生成树</li>
          </ul>

          <Title level={4}>图的应用</Title>
          <ul>
            <li>社交网络分析</li>
            <li>路由算法</li>
            <li>地图导航</li>
            <li>推荐系统</li>
            <li>网页排名算法</li>
            <li>依赖关系管理</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(GraphVisualization);
