import React, { useMemo } from 'react';
import { type StreamProcessingVisualizerProps } from './types';
import { visualizeStreamProcessing } from '../al/streaming-processor';

/**
 * 流处理可视化组件
 */
const StreamProcessingVisualizer: React.FC<StreamProcessingVisualizerProps> = ({
  chunks,
  chunkDelayMs,
  pauseAt,
  resumeAt,
  width = 800,
  height = 400,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeStreamProcessing(chunks, chunkDelayMs, pauseAt, resumeAt);
  }, [chunks, chunkDelayMs, pauseAt, resumeAt]);

  // 计算布局参数
  const layoutParams = useMemo(() => {
    return {
      timeToX: (time: number) => (time / visualData.totalTime) * (width - 100),
      itemHeight: 30,
      itemGap: 15,
      leftPadding: 50,
      topPadding: 100
    };
  }, [visualData, width]);

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
          流式数据处理可视化
        </text>

        {/* 参数信息 */}
        <text x="20" y="60" fill="#333" fontSize="14">
          数据块数: {visualData.chunks.length}
        </text>
        <text x="20" y="80" fill="#333" fontSize="14">
          块延迟: {chunkDelayMs}ms
        </text>
        {pauseAt !== undefined && (
          <text x={width - 200} y="60" fill="#333" fontSize="14">
            暂停于块: {pauseAt + 1}
          </text>
        )}
        {resumeAt !== undefined && (
          <text x={width - 200} y="80" fill="#333" fontSize="14">
            恢复于块: {resumeAt + 1}
          </text>
        )}

        {/* 时间轴 */}
        <line
          x1={layoutParams.leftPadding}
          y1={layoutParams.topPadding}
          x2={layoutParams.leftPadding + layoutParams.timeToX(visualData.totalTime)}
          y2={layoutParams.topPadding}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* 时间刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent) => {
          const time = visualData.totalTime * percent;
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

        {/* 数据块流 */}
        {visualData.timeline.map((item, index) => {
          const y = layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * index;
          const x = layoutParams.leftPadding + layoutParams.timeToX(item.time);

          // 确定块的颜色
          let blockColor = '#4ecdc4';
          if (item.event === 'pause') {
            blockColor = '#ff6b6b';
          } else if (item.event === 'resume') {
            blockColor = '#1abc9c';
          }

          return (
            <g key={`chunk-${index}`}>
              {/* 块标签 */}
              <text
                x={layoutParams.leftPadding - 10}
                y={y + layoutParams.itemHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#333"
                fontSize="14"
              >
                块 {index + 1}
              </text>

              {/* 数据块 */}
              <rect
                x={x}
                y={y}
                width={Math.max(item.chunk.length * 8, 30)}
                height={layoutParams.itemHeight}
                rx="5"
                ry="5"
                fill={blockColor}
                fillOpacity="0.7"
                stroke={blockColor}
                strokeWidth="1"
              />

              {/* 块内容 */}
              <text
                x={x + 10}
                y={y + layoutParams.itemHeight / 2}
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
              >
                {item.chunk.length > 10 ? item.chunk.substring(0, 10) + '...' : item.chunk}
              </text>

              {/* 事件标记 */}
              {item.event && (
                <g>
                  <circle
                    cx={x}
                    cy={y - 10}
                    r="8"
                    fill={item.event === 'pause' ? '#ff6b6b' : '#1abc9c'}
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {item.event === 'pause' ? 'P' : 'R'}
                  </text>
                  <text
                    x={x}
                    y={y - 25}
                    textAnchor="middle"
                    fill="#333"
                    fontSize="12"
                  >
                    {item.event === 'pause' ? '暂停' : '恢复'}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 累积结果 */}
        <text
          x="20"
          y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 20}
          fill="#333"
          fontSize="16"
          fontWeight="bold"
        >
          累积结果:
        </text>
        <foreignObject
          x="20"
          y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 40}
          width={width - 40}
          height="80"
        >
          <div
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9',
              height: '100%',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {visualData.timeline[visualData.timeline.length - 1]?.accumulated || ''}
          </div>
        </foreignObject>

        {/* 图例 */}
        <g transform={`translate(${width - 150}, 60)`}>
          <rect x="0" y="0" width="20" height="15" rx="3" ry="3" fill="#4ecdc4" fillOpacity="0.7" />
          <text x="30" y="12" fontSize="12" fill="#333">普通数据块</text>

          <rect x="0" y="25" width="20" height="15" rx="3" ry="3" fill="#ff6b6b" fillOpacity="0.7" />
          <text x="30" y="37" fontSize="12" fill="#333">暂停点</text>

          <rect x="0" y="50" width="20" height="15" rx="3" ry="3" fill="#1abc9c" fillOpacity="0.7" />
          <text x="30" y="62" fontSize="12" fill="#333">恢复点</text>
        </g>
      </svg>
    </div>
  );
};

export default StreamProcessingVisualizer;
