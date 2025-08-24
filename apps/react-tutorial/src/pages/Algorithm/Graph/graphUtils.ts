import { Graph } from '@fucking-algorithm/algorithm/graph/graph';
import type { NodeId, GraphData, GraphNode, GraphEdge, AlgorithmStep } from './types';

// 将Graph类转换为可视化所需的数据结构
export function graphToVisData<T extends NodeId>(graph: Graph<T>): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const vertices = graph.getVertices();

  // 创建节点
  vertices.forEach((vertex, index) => {
    // 计算节点位置（简单的环形布局）
    const angle = (index / vertices.length) * 2 * Math.PI;
    const radius = 150;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    nodes.push({
      id: vertex,
      label: String(vertex),
      x,
      y
    });
  });

  // 创建边
  vertices.forEach(source => {
    const neighbors = graph.getNeighbors(source);
    neighbors.forEach(neighbor => {
      const target = neighbor.vertex;

      // 对于无向图，只添加一次边（避免重复）
      if (!graph['isDirected'] && source > target) {
        return;
      }

      edges.push({
        source,
        target,
        weight: neighbor.weight,
        id: `${source}-${target}`
      });
    });
  });

  return {
    nodes,
    edges,
    isDirected: graph['isDirected']
  };
}

// 从可视化数据创建Graph实例
export function visDataToGraph<T extends NodeId>(data: GraphData): Graph<T> {
  const graph = new Graph<T>(data.isDirected);

  // 添加所有节点
  data.nodes.forEach(node => {
    graph.addVertex(node.id as T);
  });

  // 添加所有边
  data.edges.forEach(edge => {
    graph.addEdge(edge.source as T, edge.target as T, edge.weight);
  });

  return graph;
}

// 生成随机图
export function generateRandomGraph(
  nodeCount: number,
  edgeDensity: number = 0.3,
  isDirected: boolean = false,
  weighted: boolean = false
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 创建节点
  for (let i = 1; i <= nodeCount; i++) {
    const angle = (i / nodeCount) * 2 * Math.PI;
    const radius = 150;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    nodes.push({
      id: i,
      label: `${i}`,
      x,
      y
    });
  }

  // 创建边
  for (let i = 1; i <= nodeCount; i++) {
    for (let j = isDirected ? 1 : i + 1; j <= nodeCount; j++) {
      if (i !== j && Math.random() < edgeDensity) {
        edges.push({
          source: i,
          target: j,
          weight: weighted ? Math.floor(Math.random() * 10) + 1 : undefined,
          id: `${i}-${j}`
        });
      }
    }
  }

  return {
    nodes,
    edges,
    isDirected
  };
}

// 执行拓扑排序算法，返回步骤
export function runTopologicalSort<T extends NodeId>(graph: Graph<T>): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const inDegree = new Map<T, number>();
  const queue: T[] = [];
  const result: T[] = [];

  // 初始化所有顶点的入度为0
  graph.getVertices().forEach(v => inDegree.set(v, 0));

  // 计算每个顶点的入度
  graph.getVertices().forEach(v => {
    graph.getNeighbors(v).forEach(neighbor => {
      inDegree.set(neighbor.vertex, (inDegree.get(neighbor.vertex) || 0) + 1);
    });
  });

  // 记录初始状态
  steps.push({
    type: 'process',
    message: '初始化：计算所有节点的入度',
    data: { inDegree: Object.fromEntries(inDegree) }
  });

  // 入度为0的顶点入队
  inDegree.forEach((degree, vertex) => {
    if (degree === 0) {
      queue.push(vertex);
      steps.push({
        type: 'queue',
        nodeId: vertex,
        message: `节点 ${vertex} 的入度为0，加入队列`
      });
    }
  });

  // BFS遍历
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    steps.push({
      type: 'visit',
      nodeId: current,
      message: `处理节点 ${current}，加入结果`
    });

    graph.getNeighbors(current).forEach(neighbor => {
      const target = neighbor.vertex;

      steps.push({
        type: 'edge',
        edgeSource: current,
        edgeTarget: target,
        message: `减少节点 ${target} 的入度`
      });

      const newDegree = (inDegree.get(target)! - 1);
      inDegree.set(target, newDegree);

      if (newDegree === 0) {
        queue.push(target);
        steps.push({
          type: 'queue',
          nodeId: target,
          message: `节点 ${target} 的入度变为0，加入队列`
        });
      }
    });
  }

  // 检查是否有环
  const hasCircle = result.length !== graph.getVertices().length;

  steps.push({
    type: 'complete',
    message: hasCircle
      ? '检测到环，无法完成拓扑排序'
      : `拓扑排序完成，结果: ${result.join(' -> ')}`,
    data: { result, hasCircle }
  });

  return steps;
}

// 执行BFS算法，返回步骤
export function runBFS<T extends NodeId>(graph: Graph<T>, startNode: T): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<T>();
  const queue: T[] = [startNode];

  steps.push({
    type: 'queue',
    nodeId: startNode,
    message: `起始节点 ${startNode} 加入队列`
  });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;

    visited.add(current);
    steps.push({
      type: 'visit',
      nodeId: current,
      message: `访问节点 ${current}`
    });

    const neighbors = graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      const target = neighbor.vertex;

      if (!visited.has(target)) {
        queue.push(target);
        steps.push({
          type: 'edge',
          edgeSource: current,
          edgeTarget: target,
          message: `发现未访问的邻居节点 ${target}，加入队列`
        });

        steps.push({
          type: 'queue',
          nodeId: target,
          message: `节点 ${target} 加入队列`
        });
      }
    });

    steps.push({
      type: 'complete',
      nodeId: current,
      message: `完成节点 ${current} 的处理`
    });
  }

  steps.push({
    type: 'complete',
    message: `BFS遍历完成，访问顺序: ${Array.from(visited).join(' -> ')}`,
    data: { visited: Array.from(visited) }
  });

  return steps;
}

// 执行DFS算法，返回步骤
export function runDFS<T extends NodeId>(graph: Graph<T>, startNode: T): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<T>();

  function dfs(node: T) {
    if (visited.has(node)) return;

    visited.add(node);
    steps.push({
      type: 'visit',
      nodeId: node,
      message: `访问节点 ${node}`
    });

    const neighbors = graph.getNeighbors(node);
    neighbors.forEach(neighbor => {
      const target = neighbor.vertex;

      if (!visited.has(target)) {
        steps.push({
          type: 'edge',
          edgeSource: node,
          edgeTarget: target,
          message: `发现未访问的邻居节点 ${target}，递归访问`
        });

        steps.push({
          type: 'stack',
          nodeId: target,
          message: `将节点 ${target} 加入递归栈`
        });

        dfs(target);
      }
    });

    steps.push({
      type: 'complete',
      nodeId: node,
      message: `完成节点 ${node} 的处理`
    });
  }

  steps.push({
    type: 'stack',
    nodeId: startNode,
    message: `起始节点 ${startNode} 加入递归栈`
  });

  dfs(startNode);

  steps.push({
    type: 'complete',
    message: `DFS遍历完成，访问顺序: ${Array.from(visited).join(' -> ')}`,
    data: { visited: Array.from(visited) }
  });

  return steps;
}
