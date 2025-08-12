import React, { useState } from 'react';
import GraphVisualization from './GraphVisualization';
import { Graph } from '../graph';
import { createExampleGraph, createComplexExampleGraph, generateBFSVisualizationData } from './graphUtils';

interface BFSVisualizationProps {
  graph?: Graph<string | number>;
  startVertex?: string | number;
}

const BFSVisualization: React.FC<BFSVisualizationProps> = ({
  graph: initialGraph,
  startVertex: initialStartVertex,
}) => {
  const [graphType, setGraphType] = useState<'simple' | 'complex'>('simple');
  const [startVertex, setStartVertex] = useState<string | number>(initialStartVertex || 1);

  // 根据选择的图类型获取图实例
  const getGraph = () => {
    if (initialGraph) return initialGraph;
    return graphType === 'simple' ? createExampleGraph() : createComplexExampleGraph();
  };

  const graph = getGraph();
  const vertices = graph.getVertices();

  // 生成BFS可视化数据
  const { graphData, visitSequence, highlightedEdges } = generateBFSVisualizationData(
    graph,
    startVertex
  );

  return (
    <div className="bfs-visualization">
      <div className="controls">
        <div className="control-group">
          <label>图类型：</label>
          <select
            value={graphType}
            onChange={(e) => setGraphType(e.target.value as 'simple' | 'complex')}
            disabled={!!initialGraph}
          >
            <option value="simple">简单图</option>
            <option value="complex">复杂图</option>
          </select>
        </div>

        <div className="control-group">
          <label>起始顶点：</label>
          <select
            value={String(startVertex)}
            onChange={(e) => {
              const value = graphType === 'simple' ? Number(e.target.value) : e.target.value;
              setStartVertex(value);
            }}
          >
            {vertices.map((vertex) => (
              <option key={String(vertex)} value={String(vertex)}>
                {String(vertex)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="algorithm-info">
        <h3>广度优先搜索 (BFS) 算法</h3>
        <p>
          BFS是一种图遍历算法，它从根节点开始，沿着宽度方向遍历，先访问所有邻接节点，然后再访问下一层节点。
          它使用队列来存储待访问的节点，适用于寻找最短路径等场景。
        </p>
      </div>

      <GraphVisualization
        data={graphData}
        highlightedNodes={visitSequence}
        highlightedEdges={highlightedEdges}
        visitSequence={visitSequence}
      />

      <div className="code-example">
        <h3>BFS 算法实现</h3>
        <pre>
          {`function bfs(graph, startVertex) {
  const visited = new Set();
  const result = [];
  const queue = [startVertex];

  // 标记起始顶点为已访问
  visited.add(startVertex);

  while (queue.length > 0) {
    // 出队
    const currentVertex = queue.shift();

    // 添加到结果数组
    result.push(currentVertex);

    // 将所有未访问的邻接点加入队列
    for (const edge of graph.getNeighbors(currentVertex)) {
      if (!visited.has(edge.vertex)) {
        visited.add(edge.vertex);
        queue.push(edge.vertex);
      }
    }
  }

  return result;
}`}
        </pre>
      </div>

      <style>{`
        .bfs-visualization {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .controls {
          display: flex;
          margin-bottom: 20px;
          gap: 20px;
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .algorithm-info {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .code-example {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        pre {
          background-color: #f1f1f1;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
        }
      `}</style>
    </div>
  );
};

export default BFSVisualization;