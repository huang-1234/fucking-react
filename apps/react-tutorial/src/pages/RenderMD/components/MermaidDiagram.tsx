import React, { useEffect, useRef, useState, useCallback } from 'react';
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

      // 将渲染图表的逻辑提取为useCallback以提高可读性
  const renderChart = useCallback(async (chartContent: string, chartTheme: string) => {
    if (!chartContent) return;
    
    performanceMonitor.start('mermaid_render');
    setLoading(true);
    setError(null);
    
    try {
      // 清理图表代码，去除前后的```mermaid和```
      const cleanChart = chartContent.replace(/```mermaid\n?|```$/g, '').trim();
      
      // 添加调试日志
      console.log('Mermaid图表渲染中:', { 
        chartLength: cleanChart.length,
        chartId: chartId.current, 
        theme: chartTheme 
      });
      
      // 重新初始化mermaid以确保配置生效
      mermaid.initialize({
        startOnLoad: false,
        theme: chartTheme,
        securityLevel: 'strict',
        flowchart: {
          htmlLabels: true,
          curve: 'linear'
        },
        fontFamily: 'sans-serif',
        // 添加更多调试信息
        logLevel: 'debug',
      });
      
      // 使用最简单的图表进行测试
      if (cleanChart.trim() === '') {
        throw new Error('图表代码为空');
      }
      
      // 渲染Mermaid图表
      const { svg } = await mermaid.render(chartId.current, cleanChart);
      
      console.log('Mermaid渲染成功:', { svgLength: svg.length });
      
      setSvg(svg);
      setError(null);
    } catch (err) {
      console.error('Mermaid渲染错误:', err);
      setError(err instanceof Error ? err.message : '图表渲染失败');
      setSvg('');
    } finally {
      setLoading(false);
      performanceMonitor.end('mermaid_render');
    }
  }, []);
  
  // 在chart或theme变化时触发渲染
  useEffect(() => {
    let isMounted = true;
    
    // 使用setTimeout确保在渲染周期之后调用
    const timerId = setTimeout(() => {
      if (isMounted) {
        renderChart(chart, theme);
      }
    }, 100); // 增加延时，确保DOM已经准备好
    
    // 清理函数
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [chart, theme, renderChart]);

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
