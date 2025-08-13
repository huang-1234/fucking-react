import React, { useEffect, useRef } from 'react';
import G6, { Graph as G6Graph, type GraphData } from '@antv/g6';

interface GraphVisualizationProps {
  data: GraphData;
  width?: number;
  height?: number;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  visitSequence?: string[];
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  highlightedNodes = [],
  highlightedEdges = [],
  visitSequence = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<G6Graph | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 销毁之前的图实例
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 配置图实例
    const graph = new G6Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      },
      layout: {
        type: 'force',
        preventOverlap: true,
        linkDistance: 100,
      },
      defaultNode: {
        size: 40,
        style: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          lineWidth: 2,
        },
        labelCfg: {
          style: {
            fill: '#000',
            fontSize: 12,
          },
        },
      },
      defaultEdge: {
        style: {
          stroke: '#aaa',
          lineWidth: 2,
          endArrow: {
            // path: G6.Arrow.triangle(8, 10, 0),
            fill: '#aaa',
          },
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fill: '#666',
            fontSize: 10,
          },
        },
      },
    });

    // 处理数据，应用高亮效果
    const processedData = {
      ...data,
      nodes: data?.nodes?.map((node) => ({
        ...node,
        style: {
          ...node.style,
          fill: highlightedNodes.includes(node.id as string) ? '#ff7875' : '#C6E5FF',
          stroke: highlightedNodes.includes(node.id as string) ? '#ff4d4f' : '#5B8FF9',
        },
      })),
      edges: data?.edges?.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: highlightedEdges.includes(`${edge.source}-${edge.target}`) ? '#ff4d4f' : '#aaa',
          lineWidth: highlightedEdges.includes(`${edge.source}-${edge.target}`) ? 3 : 2,
        },
      })),
    };

    graph.data(processedData);
    graph.render();
    graph.fitView();

    graphRef.current = graph;

    return () => {
      graph.destroy();
    };
  }, [data, width, height, highlightedNodes, highlightedEdges]);

  // 访问序列的可视化展示
  const renderVisitSequence = () => {
    if (visitSequence.length === 0) return null;

    return (
      <div className="visit-sequence">
        <h3>访问序列</h3>
        <div className="sequence-container">
          {visitSequence.map((nodeId, index) => (
            <div key={index} className="sequence-node">
              {nodeId}
              {index < visitSequence.length - 1 && <span className="arrow">→</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="graph-visualization-container">
      <div ref={containerRef} className="graph-container" />
      {renderVisitSequence()}
      <style>
        {`
        .graph-visualization-container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .graph-container {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }
        .visit-sequence {
          margin-top: 16px;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        .sequence-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        }
        .sequence-node {
          display: flex;
          align-items: center;
          margin-right: 8px;
          font-weight: 500;
        }
        .arrow {
          margin: 0 4px;
          color: #666;
        }
        `}
      </style>
    </div>
  );
};

export default GraphVisualization;
