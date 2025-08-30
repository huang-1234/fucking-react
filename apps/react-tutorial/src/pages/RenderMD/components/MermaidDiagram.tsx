import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Spin, Button, Tooltip, Dropdown, Menu, Space } from 'antd';
import { EyeOutlined, AppstoreOutlined, BgColorsOutlined, CodeOutlined, PictureOutlined, CopyOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons';
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
  const [, setSelectedTemplate] = useState<string>('');
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
      <Menu.Item key="flowchart">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/flowchart.svg" width="16" height="16" alt="流程图" />
          <span>流程图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="sequence">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/sequence.svg" width="16" height="16" alt="时序图" />
          <span>时序图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="classDiagram">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/class.svg" width="16" height="16" alt="类图" />
          <span>类图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="stateDiagram">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/state.svg" width="16" height="16" alt="状态图" />
          <span>状态图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="gantt">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/gantt.svg" width="16" height="16" alt="甘特图" />
          <span>甘特图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="pie">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/pie.svg" width="16" height="16" alt="饼图" />
          <span>饼图</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="er">
        <Space>
          <img src="https://sf1-cdn-tos.feishucdn.com/obj/lark-doc-file/docs/images/er.svg" width="16" height="16" alt="ER图" />
          <span>ER图</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  // 主题菜单
  const themeMenu = (
    <Menu onClick={({ key }) => handleThemeChange(key as MermaidDiagramProps['theme'])}>
      <Menu.Item key="default">
        <Space>
          <div className={styles.colorSwatch} style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8' }}></div>
          <span>默认主题</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="dark">
        <Space>
          <div className={styles.colorSwatch} style={{ backgroundColor: '#282a36' }}></div>
          <span>暗色主题</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="forest">
        <Space>
          <div className={styles.colorSwatch} style={{ backgroundColor: '#cfe8cf' }}></div>
          <span>森林主题</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="neutral">
        <Space>
          <div className={styles.colorSwatch} style={{ backgroundColor: '#f9f9f9' }}></div>
          <span>中性主题</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="base">
        <Space>
          <div className={styles.colorSwatch} style={{ backgroundColor: '#eaf2fb' }}></div>
          <span>基础主题</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  // 视图模式菜单
  const viewModeMenu = (
    <Menu onClick={({ key }) => handleViewModeChange(key as 'code' | 'diagram' | 'both')}>
      <Menu.Item key="code">
        <Space>
          <CodeOutlined />
          <span>仅显示代码</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="diagram">
        <Space>
          <PictureOutlined />
          <span>仅显示图表</span>
        </Space>
      </Menu.Item>
      <Menu.Item key="both">
        <Space>
          <EyeOutlined />
          <span>代码和图表</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  // 获取当前视图模式的图标
  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'code':
        return <CodeOutlined />;
      case 'diagram':
        return <PictureOutlined />;
      case 'both':
        return <EyeOutlined />;
      default:
        return <EyeOutlined />;
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
          <Dropdown overlay={viewModeMenu} trigger={['click']} placement="bottomRight">
            <Button className={styles.controlButton} type="text">
              <Space>
                {getViewModeIcon()}
                <span className={styles.buttonText}>视图</span>
                <DownOutlined className={styles.dropdownIcon} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown overlay={templateMenu} trigger={['click']} placement="bottomRight">
            <Button className={styles.controlButton} type="text">
              <Space>
                <AppstoreOutlined />
                <span className={styles.buttonText}>模板</span>
                <DownOutlined className={styles.dropdownIcon} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown overlay={themeMenu} trigger={['click']} placement="bottomRight">
            <Button className={styles.controlButton} type="text">
              <Space>
                <BgColorsOutlined />
                <span className={styles.buttonText}>颜色</span>
                <DownOutlined className={styles.dropdownIcon} />
              </Space>
            </Button>
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
