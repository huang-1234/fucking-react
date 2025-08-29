import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Spin, Button, Tooltip, Dropdown, Menu, Typography, Space } from 'antd';
import { EyeOutlined, AppstoreOutlined, BgColorsOutlined, CodeOutlined, PictureOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { performanceMonitor } from '../tools/performance';
import styles from './MermaidDiagram.module.less';

interface MermaidDiagramProps {
  chart: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base' | 'null';
  initialView?: 'code' | 'diagram' | 'both';
}

// Mermaid模板示例
const mermaidTemplates = {
  flowchart: `flowchart LR
    A[开始] --> B{条件}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D`,
  sequence: `sequenceDiagram
    participant 客户端
    participant 服务器
    客户端->>服务器: 请求数据
    服务器-->>客户端: 响应数据`,
  classDiagram: `classDiagram
    class Animal {
      +String name
      +makeSound() void
    }
    class Dog {
      +bark() void
    }
    Animal <|-- Dog`,
  stateDiagram: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中
    处理中 --> 已完成
    处理中 --> 失败
    已完成 --> [*]
    失败 --> [*]`,
  gantt: `gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 阶段1
    任务1           :a1, 2023-01-01, 30d
    任务2           :after a1, 20d
    section 阶段2
    任务3           :2023-02-15, 25d`,
  pie: `pie title 项目分布
    "开发" : 45
    "测试" : 30
    "部署" : 15
    "文档" : 10`,
  er: `erDiagram
    客户 ||--o{ 订单 : 下单
    订单 ||--|{ 商品 : 包含`
};

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme = 'default', initialView = 'both' }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'code' | 'diagram' | 'both'>(initialView);
  const [hovering, setHovering] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cleanChart, setCleanChart] = useState<string>('');
  const mermaidRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
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
  const renderChart = useCallback(async (chartContent: string, chartTheme: MermaidDiagramProps['theme']) => {
    if (!chartContent) return;

    performanceMonitor.start('mermaid_render');
    setLoading(true);
    setError(null);

    try {
      // 清理图表代码，去除前后的```mermaid和```
      const cleanedChart = chartContent.replace(/```mermaid\n?|```$/g, '').trim();
      setCleanChart(cleanedChart);

      // 添加调试日志
      console.log('Mermaid图表渲染中:', {
        chartLength: cleanedChart.length,
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
      if (cleanedChart.trim() === '') {
        throw new Error('图表代码为空');
      }

      // 渲染Mermaid图表
      const { svg } = await mermaid.render(chartId.current, cleanedChart);

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

  // 复制代码到剪贴板
  const handleCopyCode = () => {
    if (codeRef.current) {
      const code = cleanChart;
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // 切换模板
  const handleTemplateChange = (templateKey: string) => {
    if (mermaidTemplates[templateKey as keyof typeof mermaidTemplates]) {
      const template = mermaidTemplates[templateKey as keyof typeof mermaidTemplates];
      setSelectedTemplate(templateKey);
      renderChart(template, theme);
    }
  };

  // 切换主题
  const handleThemeChange = (newTheme: MermaidDiagramProps['theme']) => {
    renderChart(cleanChart || chart, newTheme);
  };

  // 切换视图模式
  const handleViewModeChange = (mode: 'code' | 'diagram' | 'both') => {
    setViewMode(mode);
  };

  // 模板菜单
  const templateMenu = (
    <Menu onClick={({ key }) => handleTemplateChange(key.toString())}>
      <Menu.Item key="flowchart">流程图</Menu.Item>
      <Menu.Item key="sequence">时序图</Menu.Item>
      <Menu.Item key="classDiagram">类图</Menu.Item>
      <Menu.Item key="stateDiagram">状态图</Menu.Item>
      <Menu.Item key="gantt">甘特图</Menu.Item>
      <Menu.Item key="pie">饼图</Menu.Item>
      <Menu.Item key="er">ER图</Menu.Item>
    </Menu>
  );

  // 主题菜单
  const themeMenu = (
    <Menu onClick={({ key }) => handleThemeChange(key as MermaidDiagramProps['theme'])}>
      <Menu.Item key="default">默认主题</Menu.Item>
      <Menu.Item key="dark">暗色主题</Menu.Item>
      <Menu.Item key="forest">森林主题</Menu.Item>
      <Menu.Item key="neutral">中性主题</Menu.Item>
      <Menu.Item key="base">基础主题</Menu.Item>
    </Menu>
  );

  // 视图模式按钮
  const renderViewModeButton = () => {
    if (viewMode === 'code') {
      return (
        <Tooltip title="切换到图表模式">
          <Button icon={<PictureOutlined />} onClick={() => handleViewModeChange('diagram')} />
        </Tooltip>
      );
    } else if (viewMode === 'diagram') {
      return (
        <Tooltip title="切换到代码模式">
          <Button icon={<CodeOutlined />} onClick={() => handleViewModeChange('code')} />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="切换到单视图模式">
          <Button icon={<EyeOutlined />} onClick={() => handleViewModeChange('diagram')} />
        </Tooltip>
      );
    }
  };

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
      className={styles.mermaidWrapper}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* 控制按钮组 */}
      <div className={`${styles.controlButtons} ${hovering ? styles.visible : ''}`}>
        <Space>
          {renderViewModeButton()}
          <Dropdown overlay={templateMenu} placement="bottomRight">
            <Tooltip title="选择模板">
              <Button icon={<TemplateOutlined />} />
            </Tooltip>
          </Dropdown>
          <Dropdown overlay={themeMenu} placement="bottomRight">
            <Tooltip title="选择主题">
              <Button icon={<BgColorsOutlined />} />
            </Tooltip>
          </Dropdown>
        </Space>
      </div>

      {/* 内容区域 */}
      <div className={`${styles.contentContainer} ${styles[`view-${viewMode}`]}`}>
        {/* 代码区域 */}
        {(viewMode === 'code' || viewMode === 'both') && (
          <div className={styles.codeContainer}>
            <pre ref={codeRef} className={styles.codeBlock}>
              <code>{cleanChart}</code>
            </pre>
            <Tooltip title={copied ? "已复制" : "复制代码"}>
              <Button
                className={styles.copyButton}
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyCode}
              />
            </Tooltip>
          </div>
        )}

        {/* 图表区域 */}
        {(viewMode === 'diagram' || viewMode === 'both') && (
          <div
            className={styles.mermaidContainer}
            ref={mermaidRef}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(MermaidDiagram);
