import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Spin } from 'antd';
import { performanceMonitor } from '../tools/performance';
import styles from './MermaidDiagram.module.less';

interface MermaidDiagramProps {
  chart: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme = 'default' }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

  useEffect(() => {
    // 初始化Mermaid配置
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'strict',
      flowchart: {
        htmlLabels: true,
        curve: 'linear'
      },
      fontFamily: 'sans-serif',
    });
  }, [theme]); // 主题变化时重新初始化

    useEffect(() => {
    let isMounted = true; // 添加挂载状态检测

    const renderChart = async () => {
      if (!chart) return;

      performanceMonitor.start('mermaid_render');
      setLoading(true);
      setError(null);

      try {
        // 清理图表代码，去除前后的```mermaid和```
        const cleanChart = chart.replace(/```mermaid\n?|```$/g, '').trim();

        // 添加调试日志
        console.log('Mermaid图表代码:', cleanChart);

        // 确保mermaid已初始化
        await mermaid.initialize({
          startOnLoad: false,
          theme: theme,
          securityLevel: 'strict',
          flowchart: {
            htmlLabels: true,
            curve: 'linear'
          },
          fontFamily: 'sans-serif',
        });

        // 渲染Mermaid图表
        const { svg } = await mermaid.render(chartId.current, cleanChart);

        // 确保组件仍然挂载
        if (isMounted) {
          setSvg(svg);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Mermaid渲染错误:', err);
        // 确保组件仍然挂载
        if (isMounted) {
          setError(err instanceof Error ? err.message : '图表渲染失败');
          setSvg('');
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          performanceMonitor.end('mermaid_render');
        }
      }
    };

    // 使用setTimeout确保在渲染周期之后调用
    const timerId = setTimeout(() => {
      renderChart();
    }, 0);

    // 清理函数
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [chart, theme]);

  if (loading) {
    return (
      <div className={styles.mermaidLoading}>
        <Spin tip="图表渲染中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mermaidError}>
        <h4>图表渲染错误</h4>
        <pre>{error}</pre>
        <code>{chart}</code>
      </div>
    );
  }

  return (
    <div
      className={styles.mermaidContainer}
      ref={mermaidRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default React.memo(MermaidDiagram);
