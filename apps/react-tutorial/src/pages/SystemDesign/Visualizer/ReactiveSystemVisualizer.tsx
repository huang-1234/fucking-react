import React, { useMemo } from 'react';
import { type ReactiveSystemVisualizerProps } from './types';
import { visualizeReactiveSystem } from '../al/reactive-system';

/**
 * 响应式系统可视化组件
 */
const ReactiveSystemVisualizer: React.FC<ReactiveSystemVisualizerProps> = ({
  state,
  effects,
  operations,
  width = 1400,
  height = 600,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeReactiveSystem(state, effects, operations);
  }, [state, effects, operations]);

  // 计算布局参数
  const layoutParams = useMemo(() => {
    const maxTime = Math.max(...[
      ...visualData.effectHistory.map(item => item.time),
      ...visualData.stateHistory.map(item => item.time)
    ]);

    return {
      timeToX: (time: number) => (time / maxTime) * (width - 200),
      nodeSize: 40,
      nodeGap: 60,
      leftPadding: 50,
      topPadding: 150
    };
  }, [visualData, width]);

  // 生成依赖图数据
  const graphData = useMemo(() => {
    const nodes: Array<{
      id: string;
      type: 'object' | 'property' | 'effect';
      label: string;
      x: number;
      y: number;
    }> = [];

    const edges: Array<{
      source: string;
      target: string;
      type: 'dependency';
    }> = [];

    // 添加状态节点
    const stateId = 'state';
    nodes.push({
      id: stateId,
      type: 'object',
      label: 'State',
      x: layoutParams.leftPadding + layoutParams.nodeSize,
      y: layoutParams.topPadding
    });

    // 添加属性节点
    Object.keys(visualData.initialState).forEach((key, index) => {
      const propId = `prop-${key}`;
      const propX = layoutParams.leftPadding + layoutParams.nodeSize + index * layoutParams.nodeGap;
      const propY = layoutParams.topPadding + layoutParams.nodeGap;

      nodes.push({
        id: propId,
        type: 'property',
        label: key,
        x: propX,
        y: propY
      });

      // 添加属性与状态的边
      edges.push({
        source: stateId,
        target: propId,
        type: 'dependency'
      });
    });

    // 添加effect节点
    visualData.effects.forEach((effectName, index) => {
      const effectId = `effect-${index}`;
      const effectX = layoutParams.leftPadding + layoutParams.nodeSize * 3 + index * layoutParams.nodeGap;
      const effectY = layoutParams.topPadding + layoutParams.nodeGap * 2;

      nodes.push({
        id: effectId,
        type: 'effect',
        label: effectName,
        x: effectX,
        y: effectY
      });

      // 添加effect与属性的依赖边
      const dependencies = visualData.dependencies[effectName] || [];
      dependencies.forEach(propKey => {
        edges.push({
          source: `prop-${propKey}`,
          target: effectId,
          type: 'dependency'
        });
      });
    });

    return { nodes, edges };
  }, [visualData, layoutParams]);

  return (
    <div className={className} style={{ ...style, width, height, overflow: 'auto' }}>
      <svg width={width} height={Math.max(height, 600)}>
        {/* 标题 */}
        <text
          x={width / 2}
          y="30"
          textAnchor="middle"
          fill="#333"
          fontSize="18"
          fontWeight="bold"
        >
          响应式系统可视化
        </text>

        {/* 初始状态 */}
        <text x="20" y="60" fill="#333" fontSize="14" fontWeight="bold">
          初始状态:
        </text>
        <text x="100" y="60" fill="#333" fontSize="14">
          {JSON.stringify(visualData.initialState)}
        </text>

        {/* 最终状态 */}
        <text x="20" y="80" fill="#333" fontSize="14" fontWeight="bold">
          最终状态:
        </text>
        <text x="100" y="80" fill="#333" fontSize="14">
          {JSON.stringify(visualData.finalState)}
        </text>

        {/* 依赖图 */}
        <g>
          {/* 边 */}
          {graphData.edges.map((edge, index) => {
            const source = graphData.nodes.find(node => node.id === edge.source);
            const target = graphData.nodes.find(node => node.id === edge.target);

            if (!source || !target) return null;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#999"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />
                <polygon
                  points={`${target.x},${target.y} ${target.x - 5},${target.y - 3} ${target.x - 5},${target.y + 3}`}
                  fill="#999"
                />
              </g>
            );
          })}

          {/* 节点 */}
          {graphData.nodes.map(node => {
            let color = '#ddd';
            let textColor = '#333';

            if (node.type === 'object') {
              color = '#3498db';
              textColor = 'white';
            } else if (node.type === 'property') {
              color = '#e74c3c';
              textColor = 'white';
            } else if (node.type === 'effect') {
              color = '#2ecc71';
              textColor = 'white';
            }

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={layoutParams.nodeSize / 2}
                  fill={color}
                  stroke="#666"
                  strokeWidth="1"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* 时间轴 */}
        <line
          x1={layoutParams.leftPadding}
          y1={layoutParams.topPadding + layoutParams.nodeGap * 3}
          x2={layoutParams.leftPadding + width - 100}
          y2={layoutParams.topPadding + layoutParams.nodeGap * 3}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* 操作历史 */}
        <text
          x={layoutParams.leftPadding}
          y={layoutParams.topPadding + layoutParams.nodeGap * 3 - 20}
          fill="#333"
          fontSize="14"
          fontWeight="bold"
        >
          操作历史:
        </text>

        {/* 状态变化 */}
        {visualData.stateHistory.map((item, index) => {
          const x = layoutParams.leftPadding + layoutParams.timeToX(item.time);
          const y = layoutParams.topPadding + layoutParams.nodeGap * 3 + 30;

          return (
            <g key={`state-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#e74c3c"
              />
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                fill="#333"
                fontSize="12"
              >
                {item.key} = {JSON.stringify(item.value)}
              </text>
              <line
                x1={x}
                y1={layoutParams.topPadding + layoutParams.nodeGap * 3}
                x2={x}
                y2={y - 6}
                stroke="#e74c3c"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* Effect触发 */}
        {visualData.effectHistory.map((item, index) => {
          const x = layoutParams.leftPadding + layoutParams.timeToX(item.time);
          const y = layoutParams.topPadding + layoutParams.nodeGap * 3 - 30;

          return (
            <g key={`effect-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#2ecc71"
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fill="#333"
                fontSize="12"
              >
                {item.effect}
              </text>
              <line
                x1={x}
                y1={layoutParams.topPadding + layoutParams.nodeGap * 3}
                x2={x}
                y2={y + 6}
                stroke="#2ecc71"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${width - 150}, 120)`}>
          <circle cx="10" cy="10" r="8" fill="#3498db" />
          <text x="25" y="15" fontSize="12" fill="#333">状态对象</text>

          <circle cx="10" cy="35" r="8" fill="#e74c3c" />
          <text x="25" y="40" fontSize="12" fill="#333">属性</text>

          <circle cx="10" cy="60" r="8" fill="#2ecc71" />
          <text x="25" y="65" fontSize="12" fill="#333">Effect</text>

          <circle cx="10" cy="85" r="6" fill="#e74c3c" />
          <text x="25" y="90" fontSize="12" fill="#333">状态变化</text>

          <circle cx="10" cy="110" r="6" fill="#2ecc71" />
          <text x="25" y="115" fontSize="12" fill="#333">Effect触发</text>
        </g>
      </svg>
    </div>
  );
};

export default ReactiveSystemVisualizer;
