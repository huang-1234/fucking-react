import React, { useState, useEffect, useRef } from 'react';
import { createRenderer } from '../../src/utils/create-renderer';
import { dy_view_schema } from '../../types/schema.mock';
import { DySchema } from '../../types/schema';
import { IRenderMetric } from '../../src/types';
import { RenderPerformanceMonitor } from '../../src/utils/performance-monitor';

const PerformanceDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const instanceRef = useRef<any>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [metrics, setMetrics] = useState<IRenderMetric[]>([]);
  const [reportText, setReportText] = useState<string>('');
  const [perfSvg, setPerfSvg] = useState<string>('');

  // 初始化渲染器
  useEffect(() => {
    let isMounted = true;

    async function initRenderer() {
      try {
        // 创建渲染器
        const renderer = await createRenderer({
          enablePerformanceMonitor: true
        });
        if (isMounted) {
          rendererRef.current = renderer;
        }
      } catch (err) {
        console.error('Failed to create renderer', err);
      }
    }

    initRenderer();

    // 清理函数
    return () => {
      isMounted = false;
      // 清理实例引用
      instanceRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  // 开始渲染测试
  const startRenderTest = async () => {
    if (isRunning || !containerRef.current || !rendererRef.current) return;

    setIsRunning(true);
    setRenderCount(0);
    setMetrics([]);
    setReportText('');
    setPerfSvg('');

    try {
      // 清空容器（在React环境中，避免直接操作DOM）
      // 如果已有实例，先清理引用
      if (instanceRef.current) {
        instanceRef.current = null;
      }

      // 渲染初始Schema
      const instance = await rendererRef.current.render(dy_view_schema, containerRef.current);
      instanceRef.current = instance;

      // 执行10次渲染
      await runRenderTests(10);

      // 获取性能监控器
      const performanceMonitor = rendererRef.current.getPerformanceMonitor();
      if (performanceMonitor) {
        // 获取性能指标
        const metricsData = performanceMonitor.getMetrics();
        setMetrics(metricsData);

        // 生成性能报告
        const report = performanceMonitor.generateReport();
        setReportText(report);

        // 可视化性能数据
        const svg = rendererRef.current.visualizePerformance();
        setPerfSvg(svg);
      }
    } catch (err) {
      console.error('Render test error', err);
    } finally {
      setIsRunning(false);
    }
  };

  // 执行多次渲染测试
  const runRenderTests = async (count: number) => {
    if (!instanceRef.current) return;

    for (let i = 0; i < count; i++) {
      if (!instanceRef.current) break;

      // 生成随机颜色
      const hue = i * 36;
      const color = `hsl(${hue}, 100%, 50%)`;
      setBackgroundColor(color);

      // 修改Schema
      const updatedSchema = {
        ...dy_view_schema,
        __props: {
          ...dy_view_schema.__props,
          __style: {
            ...dy_view_schema.__props?.__style,
            backgroundColor: color
          }
        }
      };

      // 更新渲染
      await instanceRef.current.update(updatedSchema);
      setRenderCount(i + 1);

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 500));
    }
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
          ref={containerRef}
          style={{
            minHeight: '118px'
          }}
        />
      </div>

      {perfSvg && (
        <div>
          <h4>性能监控</h4>

          <div style={{ marginBottom: '20px' }}>
            <div dangerouslySetInnerHTML={{ __html: perfSvg }} />
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
            {reportText}
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
