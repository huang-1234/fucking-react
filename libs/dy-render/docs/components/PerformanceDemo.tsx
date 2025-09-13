import React, { useState, useEffect } from 'react';

const PerformanceDemo = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [metrics, setMetrics] = useState<Array<{ duration: number; timestamp: number }>>([]);

  // 开始渲染测试
  const startRenderTest = () => {
    if (isRunning) return;

    setIsRunning(true);
    setRenderCount(0);
    setMetrics([]);

    // 模拟10次渲染
    let count = 0;
    const maxCount = 10;
    const newMetrics: Array<{ duration: number; timestamp: number }> = [];

    const runRender = () => {
      if (count >= maxCount) {
        setIsRunning(false);
        return;
      }

      // 生成随机颜色
      const hue = count * 36;
      const color = `hsl(${hue}, 100%, 50%)`;
      setBackgroundColor(color);

      // 模拟随机渲染时间
      const duration = Math.floor(Math.random() * 150) + 50; // 50-200ms

      // 添加性能指标
      newMetrics.push({
        duration,
        timestamp: Date.now()
      });

      setMetrics([...newMetrics]);
      setRenderCount(count + 1);

      count++;

      // 延迟执行下一次渲染
      setTimeout(runRender, 500);
    };

    runRender();
  };

  // 计算平均渲染时间
  const getAverageRenderTime = () => {
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return Math.round(sum / metrics.length);
  };

  // 获取最慢渲染
  const getSlowestRender = () => {
    if (metrics.length === 0) return null;

    return metrics.reduce((slowest, current) => {
      return current.duration > slowest.duration ? current : slowest;
    }, metrics[0]);
  };

  // 获取慢渲染数量
  const getSlowRendersCount = () => {
    return metrics.filter(m => m.duration > 100).length;
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={startRenderTest}
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '渲染测试中...' : '开始渲染测试'}
        </button>
      </div>

      <div
        style={{
          backgroundColor,
          borderRadius: '4px',
          padding: '16px',
          color: '#ffffff',
          minHeight: '150px',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            padding: '10px',
            borderTop: '1px solid #fff',
            borderBottom: '1px solid #fff',
            borderLeft: '1px solid #fff',
            marginBottom: '10px'
          }}
        >
          Header
        </div>
        <div
          style={{
            padding: '10px'
          }}
        >
          <div
            style={{
              padding: '10px'
            }}
          >
            <div style={{ marginBottom: '5px' }}>List Item 1</div>
            <div style={{ marginBottom: '5px' }}>List Item 2</div>
            <div style={{ marginBottom: '5px' }}>List Item 3</div>
            <div style={{ marginBottom: '5px' }}>List Item 4</div>
          </div>
        </div>
      </div>

      {metrics.length > 0 && (
        <div>
          <h4>性能监控</h4>

          <div style={{ marginBottom: '20px' }}>
            <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
              <text x="200" y="20" textAnchor="middle" fontWeight="bold">Render Performance</text>

              {/* 绘制柱状图 */}
              {metrics.map((metric, index) => {
                const x = 40 + index * (320 / Math.max(9, metrics.length - 1));
                const barHeight = (metric.duration / 200) * 110;
                const y = 150 - barHeight;

                return (
                  <rect
                    key={index}
                    x={x - 10}
                    y={y}
                    width={20}
                    height={barHeight}
                    fill={metric.duration > 100 ? '#ff6b6b' : '#4dabf7'}
                  />
                );
              })}

              {/* 坐标轴 */}
              <line x1="40" y1="150" x2="360" y2="150" stroke="black" />
              <line x1="40" y1="40" x2="40" y2="150" stroke="black" />

              {/* 标签 */}
              <text x="200" y="190" textAnchor="middle">Render Index</text>
              <text x="10" y="100" textAnchor="middle" transform="rotate(-90, 10, 100)">Duration (ms)</text>
            </svg>
          </div>

          <div
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              padding: '16px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}
          >
{`渲染性能报告:
- 总渲染次数: ${metrics.length}
- 平均渲染时间: ${getAverageRenderTime()}ms
- 最慢渲染: ${getSlowestRender() ? `Render ${metrics.indexOf(getSlowestRender()!) + 1} (${getSlowestRender()!.duration}ms)` : 'N/A'}
- 慢渲染次数: ${getSlowRendersCount()} (>100ms)`}
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <p><strong>渲染次数：</strong> {renderCount}/10</p>
        <p><strong>当前状态：</strong> {isRunning ? '渲染测试中' : renderCount > 0 ? '渲染测试完成' : '等待开始'}</p>
      </div>
    </div>
  );
};

export default PerformanceDemo;
