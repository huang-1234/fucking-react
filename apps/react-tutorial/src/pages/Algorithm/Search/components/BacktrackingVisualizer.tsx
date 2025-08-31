import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

interface BacktrackingVisualizerProps<T> {
  treeData?: BacktrackingTreeNode<T>;
  currentPath?: T[];
  usedItems?: boolean[];
  width?: number | string;
  height?: number | string;
  onNodeClick?: (path: T[]) => void;
}

export interface BacktrackingTreeNode<T> {
  value: T | null;
  children: BacktrackingTreeNode<T>[];
  isActive?: boolean;
  isInPath?: boolean;
  isSolution?: boolean;
}

const BacktrackingVisualizer = <T extends React.ReactNode>({
  treeData,
  currentPath = [],
  usedItems = [],
  width = '100%',
  height = 400,
  onNodeClick
}: BacktrackingVisualizerProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Convert tree data to ECharts format
  const convertToEChartsFormat = (node: BacktrackingTreeNode<T>, parentId?: string): any => {
    const id = parentId ? `${parentId}-${node.value}` : `${node.value}`;

    const result: any = {
      name: node.value !== null ? `${node.value}` : 'Root',
      value: node.value,
      itemStyle: {
        color: node.isSolution
          ? '#55efc4' // Solution node
          : node.isInPath
            ? '#fdcb6e' // In current path
            : node.isActive
              ? '#ff7675' // Active node
              : '#a29bfe' // Default
      }
    };

    if (node.children && node.children.length > 0) {
      result.children = node.children.map(child => convertToEChartsFormat(child, id));
    }

    return result;
  };

  // Convert tree data to Ant Design Tree format
  const convertToAntdTreeFormat = (node: BacktrackingTreeNode<T>, parentKey?: string): DataNode => {
    const key = parentKey ? `${parentKey}-${node.value}` : `${node.value}`;

    const result: DataNode = {
      key,
      title: node.value !== null ? `${node.value}` : 'Root',
      className: node.isSolution
        ? 'solution-node'
        : node.isInPath
          ? 'path-node'
          : node.isActive
            ? 'active-node'
            : ''
    };

    if (node.children && node.children.length > 0) {
      result.children = node.children.map(child => convertToAntdTreeFormat(child, key));
    }

    return result;
  };

  useEffect(() => {
    if (!chartRef.current || !treeData) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const data = convertToEChartsFormat(treeData);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}'
      },
      series: [
        {
          type: 'tree',
          data: [data],
          top: '10%',
          left: '10%',
          bottom: '10%',
          right: '10%',
          symbolSize: 12,
          orient: 'vertical',
          label: {
            position: 'top',
            rotate: 0,
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 12
          },
          leaves: {
            label: {
              position: 'bottom',
              rotate: 0,
              verticalAlign: 'middle',
              align: 'center'
            }
          },
          expandAndCollapse: false,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [treeData, currentPath]);

  // Render the current path
  const renderCurrentPath = () => {
    if (!currentPath || currentPath.length === 0) {
      return null;
    }

    return (
      <div style={{ marginTop: 16 }}>
        <h4>Current Path</h4>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: '#f5f6fa',
          borderRadius: '8px'
        }}>
          {currentPath.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '4px 12px',
                backgroundColor: '#fdcb6e',
                borderRadius: '4px',
                color: '#2d3436',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {item}
              {index < currentPath.length - 1 && (
                <span style={{ marginLeft: 8 }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render used items for permutation problems
  const renderUsedItems = () => {
    if (!usedItems || usedItems.length === 0) {
      return null;
    }

    return (
      <div style={{ marginTop: 16 }}>
        <h4>Used Items</h4>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: '#f5f6fa',
          borderRadius: '8px'
        }}>
          {usedItems.map((used, index) => (
            <div
              key={index}
              style={{
                padding: '4px 12px',
                backgroundColor: used ? '#ff7675' : '#a29bfe',
                borderRadius: '4px',
                color: 'white',
                fontWeight: 500
              }}
            >
              {index}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // If tree data is not provided, show a message
  if (!treeData) {
    return <div>No data available for visualization</div>;
  }

  return (
    <div>
      <div
        ref={chartRef}
        style={{
          width,
          height,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      />
      {renderCurrentPath()}
      {renderUsedItems()}

      <style jsx>{`
        .solution-node {
          color: #55efc4;
          font-weight: bold;
        }
        .path-node {
          color: #fdcb6e;
          font-weight: 500;
        }
        .active-node {
          color: #ff7675;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default BacktrackingVisualizer;
