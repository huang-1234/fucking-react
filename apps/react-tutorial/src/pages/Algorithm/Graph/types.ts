// 定义图的节点和边的类型
export type NodeId = string | number;

export interface GraphNode {
  id: NodeId;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: NodeId;
  target: NodeId;
  weight?: number;
  id?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
}

// 定义算法可视化的状态
export interface AlgorithmStep {
  type: 'visit' | 'process' | 'complete' | 'edge' | 'queue' | 'stack';
  nodeId?: NodeId;
  edgeSource?: NodeId;
  edgeTarget?: NodeId;
  message?: string;
  data?: any;
}

// 定义算法可视化的类型
export type AlgorithmType = 'bfs' | 'dfs' | 'topological-sort';

// 定义节点的状态
export type NodeStatus = 'default' | 'active' | 'visited' | 'processing' | 'completed';

// 定义边的状态
export type EdgeStatus = 'default' | 'active' | 'visited' | 'processing';
