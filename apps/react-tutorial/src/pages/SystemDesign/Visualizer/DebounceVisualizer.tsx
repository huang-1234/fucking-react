import React, { useMemo } from 'react';
import { type DebounceVisualizerProps } from './types';
import { visualizeDebounce } from '../al/debounce';

/**
 * 防抖函数可视化组件
 */
const DebounceVisualizer: React.FC<DebounceVisualizerProps> = ({
  callTimestamps,
  delay,
  // immediate参数用于支持立即执行模式
  immediate = false,
  width = 1200,
  height = 600,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeDebounce(callTimestamps, delay);
  }, [callTimestamps, delay]);

  // 计算时间轴参数
  const timelineParams = useMemo(() => {
    const allTimestamps = [...visualData.calls, ...visualData.executions];
    const minTime = Math.min(...allTimestamps);
    const maxTime = Math.max(...allTimestamps);
    const timeRange = maxTime - minTime;

    // 添加边距
    const paddingTime = timeRange * 0.1;
    const startTime = minTime - paddingTime;
    const endTime = maxTime + paddingTime;
    const totalTime = endTime - startTime;

    return {
      startTime,
      endTime,
      totalTime,
      timeToX: (time: number) => ((time - startTime) / totalTime) * width
    };
  }, [visualData, width]);

  // 绘制SVG
  return (
    <div className={className} style={{ ...style, width, height, overflow: 'hidden' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 时间轴 */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* 调用标记 */}
        {visualData.calls.map((time, index) => {
          const x = timelineParams.timeToX(time);
          return (
            <g key={`call-${index}`}>
              <circle
                cx={x}
                cy={height / 2 - 30}
                r="6"
                fill="#ff6b6b"
              />
              <text
                x={x}
                y={height / 2 - 50}
                textAnchor="middle"
                fill="#333"
                fontSize="12"
              >
                调用 {index + 1}
              </text>
              <line
                x1={x}
                y1={height / 2 - 24}
                x2={x}
                y2={height / 2 - 10}
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* 执行标记 */}
        {visualData.executions.map((time, index) => {
          const x = timelineParams.timeToX(time);
          return (
            <g key={`exec-${index}`}>
              <circle
                cx={x}
                cy={height / 2 + 30}
                r="8"
                fill="#4ecdc4"
              />
              <text
                x={x}
                y={height / 2 + 50}
                textAnchor="middle"
                fill="#333"
                fontSize="12"
              >
                执行 {index + 1}
              </text>
              <line
                x1={x}
                y1={height / 2 + 10}
                x2={x}
                y2={height / 2 + 22}
                stroke="#4ecdc4"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* 延迟区域 */}
        {visualData.calls.map((time, index) => {
          const x = timelineParams.timeToX(time);
          const nextCallTime = index < visualData.calls.length - 1 ? visualData.calls[index + 1] : Infinity;
          const executionTime = time + delay;

          // 只有当下一个调用在执行前发生时，才显示延迟区域
          if (nextCallTime < executionTime) {
            const nextX = timelineParams.timeToX(nextCallTime);
            return (
              <rect
                key={`delay-${index}`}
                x={x}
                y={height / 2 - 5}
                width={nextX - x}
                height={10}
                fill="#ffe66d"
                fillOpacity="0.5"
              />
            );
          }

          // 如果是最后一个调用或者没有被取消的调用
          const endX = timelineParams.timeToX(executionTime);
          return (
            <rect
              key={`delay-${index}`}
              x={x}
              y={height / 2 - 5}
              width={endX - x}
              height={10}
              fill="#4ecdc4"
              fillOpacity="0.3"
            />
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${width - 150}, 20)`}>
          <circle cx="10" cy="10" r="6" fill="#ff6b6b" />
          <text x="25" y="15" fontSize="12" fill="#333">调用</text>

          <circle cx="10" cy="35" r="8" fill="#4ecdc4" />
          <text x="25" y="40" fontSize="12" fill="#333">执行</text>

          <rect x="5" y="55" width="10" height="10" fill="#ffe66d" fillOpacity="0.5" />
          <text x="25" y="65" fontSize="12" fill="#333">取消的延迟</text>

          <rect x="5" y="75" width="10" height="10" fill="#4ecdc4" fillOpacity="0.3" />
          <text x="25" y="85" fontSize="12" fill="#333">有效的延迟</text>
        </g>

        {/* 延迟时间标注 */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fill="#333"
          fontSize="14"
          fontWeight="bold"
        >
          延迟时间: {delay}ms
        </text>
      </svg>
    </div>
  );
};

export default DebounceVisualizer;
