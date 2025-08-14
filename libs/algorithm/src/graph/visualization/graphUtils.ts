import { GraphData } from '@antv/g6';
import { Graph } from '../graph';

/**
 * 将图数据结构转换为G6可视化格式
 */
export function convertGraphToG6Data(graph: Graph<string | number>): GraphData {
  const nodes = graph.getVertices().map(vertex => ({
    id: String(vertex),
    label: String(vertex),
  }));

  const edges: any[] = [];
  graph.getVertices().forEach(vertex => {
    const neighbors = graph.getNeighbors(vertex);
    neighbors.forEach(neighbor => {
      // 对于无向图，避免重复添加边
      const edgeId = `${vertex}-${neighbor.vertex}`;
      const reverseEdgeId = `${neighbor.vertex}-${vertex}`;

      if (!edges.some(e => e.id === edgeId || e.id === reverseEdgeId)) {
        edges.push({
          id: edgeId,
          source: String(vertex),
          target: String(neighbor.vertex),
          label: neighbor.weight ? String(neighbor.weight) : '',
        });
      }
    });
  });

  return { nodes, edges };
}

/**
 * 生成BFS算法的可视化数据
 */
export function generateBFSVisualizationData(
  graph: Graph<string | number>,
  startVertex: string | number
): {
  graphData: GraphData;
  visitSequence: string[];
  highlightedEdges: string[];
} {
  const g6Data = convertGraphToG6Data(graph);
  const visited = new Set<string | number>();
  const visitSequence: string[] = [];
  const highlightedEdges: string[] = [];
  const queue = [startVertex];

  visited.add(startVertex);
  visitSequence.push(String(startVertex));

  while (queue.length > 0) {
    const currentVertex = queue.shift()!;

    const neighbors = graph.getNeighbors(currentVertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        visited.add(neighbor.vertex);
        queue.push(neighbor.vertex);
        visitSequence.push(String(neighbor.vertex));
        highlightedEdges.push(`${currentVertex}-${neighbor.vertex}`);
      }
    }
  }

  return {
    graphData: g6Data,
    visitSequence,
    highlightedEdges,
  };
}

/**
 * 生成DFS算法的可视化数据
 */
export function generateDFSVisualizationData(
  graph: Graph<string | number>,
  startVertex: string | number
): {
  graphData: GraphData;
  visitSequence: string[];
  highlightedEdges: string[];
} {
  const g6Data = convertGraphToG6Data(graph);
  const visited = new Set<string | number>();
  const visitSequence: string[] = [];
  const highlightedEdges: string[] = [];

  function dfs(vertex: string | number) {
    visited.add(vertex);
    visitSequence.push(String(vertex));

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        highlightedEdges.push(`${vertex}-${neighbor.vertex}`);
        dfs(neighbor.vertex);
      }
    }
  }

  dfs(startVertex);

  return {
    graphData: g6Data,
    visitSequence,
    highlightedEdges,
  };
}

/**
 * 创建示例图
 */
export function createExampleGraph(): Graph<number> {
  const graph = new Graph<number>(false); // 无向图
  graph.addEdge(1, 2);
  graph.addEdge(1, 3);
  graph.addEdge(2, 4);
  graph.addEdge(3, 4);
  graph.addEdge(4, 5);
  return graph;
}

/**
 * 创建复杂示例图
 */
export function createComplexExampleGraph(): Graph<string> {
  const graph = new Graph<string>(false); // 无向图
  graph.addEdge('A', 'B');
  graph.addEdge('A', 'C');
  graph.addEdge('B', 'D');
  graph.addEdge('B', 'E');
  graph.addEdge('C', 'F');
  graph.addEdge('C', 'G');
  graph.addEdge('D', 'H');
  graph.addEdge('E', 'H');
  graph.addEdge('F', 'I');
  graph.addEdge('G', 'I');
  graph.addEdge('H', 'J');
  graph.addEdge('I', 'J');
  return graph;
}

/**
 * 创建有向图示例
 */
export function createDirectedExampleGraph(): Graph<string> {
  const graph = new Graph<string>(true); // 有向图
  graph.addEdge('A', 'B');
  graph.addEdge('A', 'C');
  graph.addEdge('B', 'D');
  graph.addEdge('C', 'D');
  graph.addEdge('D', 'E');
  return graph;
}
