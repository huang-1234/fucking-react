import React, { useMemo } from 'react';
import { type FlattenPromisesVisualizerProps } from './types';
import { visualizeFlattenPromises } from '../al/flatten-promises';

/**
 * Promise扁平化可视化组件
 */
const FlattenPromisesVisualizer: React.FC<FlattenPromisesVisualizerProps> = ({
  inputArray,
  resolveTimings,
  parallel = true,
  width = 800,
  height = 400,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeFlattenPromises(inputArray, resolveTimings, parallel);
  }, [inputArray, resolveTimings, parallel]);

  // 计算布局参数
  const layoutParams = useMemo(() => {
    const maxEndTime = Math.max(...visualData.timeline.map(item => item.endTime));

    return {
      timeToX: (time: number) => (time / maxEndTime) * (width - 200),
      itemHeight: 30,
      itemGap: 10,
      leftPadding: 150,
      topPadding: 80
    };
  }, [visualData, width]);

  // 格式化数组显示
  const formatArray = (arr: any[]): string => {
    return JSON.stringify(arr)
      .replace(/,/g, ', ')
      .replace(/\[/g, '[ ')
      .replace(/\]/g, ' ]');
  };

  return (
    <div className={className} style={{ ...style, width, height, overflow: 'auto' }}>
      <svg width={width} height={Math.max(height, visualData.timeline.length * (layoutParams.itemHeight + layoutParams.itemGap) + 200)}>
        {/* 标题 */}
        <text
          x={width / 2}
          y="30"
          textAnchor="middle"
          fill="#333"
          fontSize="18"
          fontWeight="bold"
        >
          Promise扁平化与{parallel ? '并行' : '串行'}解析
        </text>

        {/* 输入数组 */}
        <text
          x="20"
          y="60"
          fill="#333"
          fontSize="14"
        >
          输入: {formatArray(visualData.original)}
        </text>

        {/* 扁平化后数组 */}
        <text
          x="20"
          y="80"
          fill="#333"
          fontSize="14"
        >
          扁平化: {formatArray(visualData.flattened)}
        </text>

        {/* 时间轴标题 */}
        <text
          x={layoutParams.leftPadding}
          y={layoutParams.topPadding - 10}
          fill="#333"
          fontSize="14"
          fontWeight="bold"
        >
          时间轴
        </text>

        {/* 时间刻度 */}
        <line
          x1={layoutParams.leftPadding}
          y1={layoutParams.topPadding}
          x2={layoutParams.leftPadding + width - 200}
          y2={layoutParams.topPadding}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* 时间刻度标记 */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent) => {
          const maxEndTime = Math.max(...visualData.timeline.map(item => item.endTime));
          const time = maxEndTime * percent;
          const x = layoutParams.leftPadding + layoutParams.timeToX(time);
          return (
            <g key={`time-${percent}`}>
              <line
                x1={x}
                y1={layoutParams.topPadding - 5}
                x2={x}
                y2={layoutParams.topPadding + 5}
                stroke="#666"
                strokeWidth="1"
              />
              <text
                x={x}
                y={layoutParams.topPadding - 10}
                textAnchor="middle"
                fill="#666"
                fontSize="12"
              >
                {Math.round(time)}ms
              </text>
            </g>
          );
        })}

        {/* Promise执行时间线 */}
        {visualData.timeline.map((item, index) => {
          const y = layoutParams.topPadding + (layoutParams.itemHeight + layoutParams.itemGap) * (index + 1);
          const startX = layoutParams.leftPadding + layoutParams.timeToX(item.startTime);
          const endX = layoutParams.leftPadding + layoutParams.timeToX(item.endTime);

          return (
            <g key={`promise-${item.id}`}>
              {/* Promise标签 */}
              <text
                x={layoutParams.leftPadding - 10}
                y={y + layoutParams.itemHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#333"
                fontSize="14"
              >
                Promise {item.id + 1}
              </text>

              {/* 执行背景 */}
              <rect
                x={startX}
                y={y}
                width={endX - startX}
                height={layoutParams.itemHeight}
                rx="5"
                ry="5"
                fill="#6a89cc"
                fillOpacity="0.2"
                stroke="#6a89cc"
                strokeWidth="1"
              />

              {/* 执行进度 */}
              <rect
                x={startX}
                y={y}
                width={endX - startX}
                height={layoutParams.itemHeight}
                rx="5"
                ry="5"
                fill="#6a89cc"
                fillOpacity="0.6"
              >
                <animate
                  attributeName="width"
                  from="0"
                  to={endX - startX}
                  dur={`${item.endTime - item.startTime}ms`}
                  begin="0s"
                  fill="freeze"
                />
              </rect>

              {/* 完成标记 */}
              <circle
                cx={endX}
                cy={y + layoutParams.itemHeight / 2}
                r="5"
                fill="#6a89cc"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.3s"
                  begin={`${item.endTime}ms`}
                  fill="freeze"
                />
              </circle>

              {/* 执行时间 */}
              <text
                x={endX + 10}
                y={y + layoutParams.itemHeight / 2}
                dominantBaseline="middle"
                fill="#333"
                fontSize="12"
              >
                {item.endTime - item.startTime}ms
              </text>
            </g>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${width - 150}, 60)`}>
          <rect x="0" y="0" width="20" height="15" rx="3" ry="3" fill="#6a89cc" fillOpacity="0.6" />
          <text x="30" y="12" fontSize="12" fill="#333">Promise执行</text>

          <circle cx="10" cy="35" r="5" fill="#6a89cc" />
          <text x="30" y="40" fontSize="12" fill="#333">完成解析</text>
        </g>

        {/* 模式说明 */}
        <text
          x={width / 2}
          y={layoutParams.topPadding + (layoutParams.itemHeight + layoutParams.itemGap) * (visualData.timeline.length + 1) + 30}
          textAnchor="middle"
          fill="#333"
          fontSize="16"
          fontWeight="bold"
        >
          {parallel ? '并行模式: 所有Promise同时开始执行' : '串行模式: Promise按顺序依次执行'}
        </text>
      </svg>
    </div>
  );
};

export default FlattenPromisesVisualizer;
