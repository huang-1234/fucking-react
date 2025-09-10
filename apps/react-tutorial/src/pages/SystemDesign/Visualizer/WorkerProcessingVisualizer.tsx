import React, { useMemo } from 'react';
import { type WorkerProcessingVisualizerProps } from './types';
import { visualizeWorkerProcessing } from '../al/data-processor';

/**
 * Web Worker数据处理可视化组件
 */
const WorkerProcessingVisualizer: React.FC<WorkerProcessingVisualizerProps> = ({
  dataSize,
  chunkSize,
  processingTime,
  width = 1200,
  height = 600,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeWorkerProcessing(dataSize, chunkSize, processingTime);
  }, [dataSize, chunkSize, processingTime]);

  // 计算布局参数
  const layoutParams = useMemo(() => {
    return {
      timeToX: (time: number) => (time / visualData.totalTime) * (width - 200),
      itemHeight: 30,
      itemGap: 10,
      leftPadding: 150,
      topPadding: 120
    };
  }, [visualData, width]);

  return (
    <div className={className} style={{ ...style, width, height, overflow: 'auto' }}>
      <svg width={width} height={Math.max(height, visualData.timeline.length * (layoutParams.itemHeight + layoutParams.itemGap) + 300)}>
        {/* 标题 */}
        <text
          x={width / 2}
          y="30"
          textAnchor="middle"
          fill="#333"
          fontSize="18"
          fontWeight="bold"
        >
          Web Worker大数据处理可视化
        </text>

        {/* 参数信息 */}
        <text x="20" y="60" fill="#333" fontSize="14">
          数据大小: {dataSize.toLocaleString()} 条
        </text>
        <text x="20" y="80" fill="#333" fontSize="14">
          分片大小: {chunkSize.toLocaleString()} 条/片
        </text>
        <text x="20" y="100" fill="#333" fontSize="14">
          分片数量: {visualData.chunkCount} 片
        </text>

        <text x={width - 250} y="60" fill="#333" fontSize="14">
          总处理时间: {Math.round(visualData.totalTime)}ms
        </text>
        <text x={width - 250} y="80" fill="#333" fontSize="14">
          主线程处理时间: {Math.round(visualData.mainThreadTime)}ms
        </text>
        <text x={width - 250} y="100" fill="#333" fontSize="14" fontWeight="bold">
          加速比: {visualData.speedup.toFixed(1)}x
        </text>

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

        {/* Worker处理时间线 */}
        {visualData.timeline.map((item, index) => {
          const y = layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * index;
          const startX = layoutParams.leftPadding + layoutParams.timeToX(item.startTime);
          const endX = layoutParams.leftPadding + layoutParams.timeToX(item.endTime);

          return (
            <g key={`worker-${index}`}>
              {/* Worker标签 */}
              <text
                x={layoutParams.leftPadding - 10}
                y={y + layoutParams.itemHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#333"
                fontSize="14"
              >
                Worker {index + 1}
              </text>

              {/* 处理背景 */}
              <rect
                x={startX}
                y={y}
                width={endX - startX}
                height={layoutParams.itemHeight}
                rx="5"
                ry="5"
                fill="#3498db"
                fillOpacity="0.2"
                stroke="#3498db"
                strokeWidth="1"
              />

              {/* 处理进度 */}
              <rect
                x={startX}
                y={y}
                width={endX - startX}
                height={layoutParams.itemHeight}
                rx="5"
                ry="5"
                fill="#3498db"
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

              {/* 处理项目数 */}
              <text
                x={(startX + endX) / 2}
                y={y + layoutParams.itemHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {item.itemsProcessed.toLocaleString()} 项
              </text>

              {/* 完成时间 */}
              <text
                x={endX + 10}
                y={y + layoutParams.itemHeight / 2}
                dominantBaseline="middle"
                fill="#333"
                fontSize="12"
              >
                {Math.round(item.endTime)}ms
              </text>
            </g>
          );
        })}

        {/* 主线程对比 */}
        <g>
          <text
            x="20"
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 30}
            fill="#333"
            fontSize="16"
            fontWeight="bold"
          >
            主线程 vs. Web Worker 对比:
          </text>

          {/* 主线程处理时间 */}
          <text
            x={layoutParams.leftPadding - 10}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 60}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#333"
            fontSize="14"
          >
            主线程
          </text>

          <rect
            x={layoutParams.leftPadding}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 45}
            width={layoutParams.timeToX(visualData.mainThreadTime)}
            height={layoutParams.itemHeight}
            rx="5"
            ry="5"
            fill="#e74c3c"
            fillOpacity="0.6"
            stroke="#e74c3c"
            strokeWidth="1"
          />

          <text
            x={layoutParams.leftPadding + layoutParams.timeToX(visualData.mainThreadTime) / 2}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 60}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {Math.round(visualData.mainThreadTime)}ms (阻塞UI)
          </text>

          {/* Web Worker处理时间 */}
          <text
            x={layoutParams.leftPadding - 10}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 60 + layoutParams.itemHeight + layoutParams.itemGap}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#333"
            fontSize="14"
          >
            Web Workers
          </text>

          <rect
            x={layoutParams.leftPadding}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 45 + layoutParams.itemHeight + layoutParams.itemGap}
            width={layoutParams.timeToX(visualData.totalTime)}
            height={layoutParams.itemHeight}
            rx="5"
            ry="5"
            fill="#2ecc71"
            fillOpacity="0.6"
            stroke="#2ecc71"
            strokeWidth="1"
          />

          <text
            x={layoutParams.leftPadding + layoutParams.timeToX(visualData.totalTime) / 2}
            y={layoutParams.topPadding + 30 + (layoutParams.itemHeight + layoutParams.itemGap) * visualData.timeline.length + 60 + layoutParams.itemHeight + layoutParams.itemGap}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {Math.round(visualData.totalTime)}ms (不阻塞UI)
          </text>
        </g>

        {/* 图例 */}
        <g transform={`translate(${width - 180}, 120)`}>
          <rect x="0" y="0" width="20" height="15" rx="3" ry="3" fill="#3498db" fillOpacity="0.6" />
          <text x="30" y="12" fontSize="12" fill="#333">Worker处理</text>

          <rect x="0" y="25" width="20" height="15" rx="3" ry="3" fill="#e74c3c" fillOpacity="0.6" />
          <text x="30" y="37" fontSize="12" fill="#333">主线程处理</text>

          <rect x="0" y="50" width="20" height="15" rx="3" ry="3" fill="#2ecc71" fillOpacity="0.6" />
          <text x="30" y="62" fontSize="12" fill="#333">并行Worker处理</text>
        </g>
      </svg>
    </div>
  );
};

export default WorkerProcessingVisualizer;
