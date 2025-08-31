import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { type Graph } from '../al/dfs/dfs_ts';

interface GraphVisualizerProps {
  graph: Graph;
  visitedNodes?: Set<string>;
  currentNode?: string;
  path?: string[];
  stack?: string[];
  queue?: string[];
  width?: number | string;
  height?: number | string;
  directed?: boolean;
  onNodeClick?: (node: string) => void;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graph,
  visitedNodes = new Set(),
  currentNode,
  path = [],
  stack = [],
  queue = [],
  width = '100%',
  height = 400,
  directed = true,
  onNodeClick
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Convert graph to nodes and links for ECharts
  const getGraphData = () => {
    const nodes: { id: string; name: string; category: number; itemStyle?: any }[] = [];
    const links: { source: string; target: string; lineStyle?: any }[] = [];
    const nodeSet = new Set<string>();

    // Add all nodes from graph
    Object.keys(graph).forEach(node => {
      nodeSet.add(node);
      nodes.push({
        id: node,
        name: node,
        category: currentNode === node ? 1 : visitedNodes.has(node) ? 2 : 0,
        itemStyle: {
          color: currentNode === node
            ? '#ff7675'
            : path.includes(node)
              ? '#fdcb6e'
              : visitedNodes.has(node)
                ? '#74b9ff'
                : '#a29bfe'
        }
      });

      // Add all neighbors
      graph[node]?.forEach(neighbor => {
        nodeSet.add(neighbor);
        links.push({
          source: node,
          target: neighbor,
          lineStyle: {
            color: path.includes(node) && path.includes(neighbor) &&
                  Math.abs(path.indexOf(node) - path.indexOf(neighbor)) === 1
              ? '#fdcb6e'
              : visitedNodes.has(node) && visitedNodes.has(neighbor)
                ? '#74b9ff'
                : '#a29bfe',
            width: path.includes(node) && path.includes(neighbor) &&
                  Math.abs(path.indexOf(node) - path.indexOf(neighbor)) === 1
              ? 3
              : 1,
            type: path.includes(node) && path.includes(neighbor) &&
                 Math.abs(path.indexOf(node) - path.indexOf(neighbor)) === 1
              ? 'solid'
              : 'dashed'
          }
        });
      });
    });

    // Add any nodes that are only targets and not sources
    nodeSet.forEach(node => {
      if (!nodes.find(n => n.id === node)) {
        nodes.push({
          id: node,
          name: node,
          category: currentNode === node ? 1 : visitedNodes.has(node) ? 2 : 0,
          itemStyle: {
            color: currentNode === node
              ? '#ff7675'
              : path.includes(node)
                ? '#fdcb6e'
                : visitedNodes.has(node)
                  ? '#74b9ff'
                  : '#a29bfe'
          }
        });
      }
    });

    return { nodes, links };
  };

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const { nodes, links } = getGraphData();

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `Node: ${params.data.name}`;
          } else {
            return `Edge: ${params.data.source} -> ${params.data.target}`;
          }
        }
      },
      legend: [
        {
          data: ['Unvisited', 'Current', 'Visited'],
          textStyle: {
            color: '#333'
          }
        }
      ],
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          categories: [
            { name: 'Unvisited' },
            { name: 'Current' },
            { name: 'Visited' }
          ],
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          force: {
            repulsion: 100,
            edgeLength: 80
          },
          lineStyle: {
            color: '#a29bfe',
            curveness: directed ? 0.2 : 0
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          },
          edgeSymbol: directed ? ['none', 'arrow'] : ['none', 'none']
        }
      ]
    };

    chartInstance.current.setOption(option);

    // Add click event handler
    if (onNodeClick) {
      chartInstance.current.on('click', (params) => {
        if (params.dataType === 'node') {
          /**
           * @TODO: 这里需要类型断言，因为 params.data 的类型是 unknown
           */
          onNodeClick(params.data as unknown as string);
        }
      });
    }

    const handleResize = () => {
      setIsResizing(true);
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
      setTimeout(() => setIsResizing(false), 300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.off('click');
      }
    };
  }, [graph, visitedNodes, currentNode, path, stack, queue, onNodeClick, directed, isResizing]);

  return (
    <div
      ref={chartRef}
      style={{
        width,
        height,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    />
  );
};

export default GraphVisualizer;
