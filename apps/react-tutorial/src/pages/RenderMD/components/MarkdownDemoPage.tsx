import React, { useState } from 'react';
import { Tabs, Card, Space, Typography, Switch, Select } from 'antd';
import { ThemeName } from '../modules/theme/ThemeDefinitions';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownEditor from './MarkdownEditor';
import CodeBlock from './CodeBlock';
import MermaidDiagram from './MermaidDiagram';
import MermaidTest from './MermaidTest';
import TableOfContents from './TableOfContents';
import ControlPanel from './ControlPanel';
import PerformancePanel from './PerformancePanel';
import type { MarkdownConfig } from '../types/markdown';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;
const { Option } = Select;
import { mermaidExample, mathExample, tableExample, codeExample, combinedExample } from '../common/MarkdownDemoPage';

const MarkdownDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('combined');
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(ThemeName.LIGHT);
  // 当前内容示例
  const [config, setConfig] = useState<MarkdownConfig>({
    theme: 'light',
    enableCache: true,
    enableVirtualScroll: false,
    enableToc: true,
    enableMath: true,
    enableGfm: true,
    enableSanitize: true,
    linkTarget: '_blank'
  });

  // 获取当前示例内容
  const getExampleContent = () => {
    switch (activeTab) {
      case 'mermaid': return mermaidExample;
      case 'math': return mathExample;
      case 'table': return tableExample;
      case 'code': return codeExample;
      case 'combined': return combinedExample;
      default: return combinedExample;
    }
  };

  // 提取标题生成目录
  const extractHeadings = (content: string) => {
    const regex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      headings.push({ id, text, level });
    }

    return headings;
  };

  const headings = extractHeadings(getExampleContent());

  // 处理主题变更
  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    setConfig(prev => ({ ...prev, theme }));

    // 更新文档主题
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <>
      {/* 左侧目录 - 现在作为固定侧边栏 */}
      {config.enableToc && (
        <TableOfContents
          headings={headings}
          defaultExpanded={false}
        />
      )}

      {/* 右侧控制面板 - 保持原样 */}
      <ControlPanel
        config={config}
        onChange={setConfig}
        defaultExpanded={false}
      />

      {/* 主内容区 */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '100%',
        padding: '10px', marginRight: '40px', height: '100%',
        overflow: 'auto'
      }}>
        <Title level={2}>Markdown渲染扩展功能演示</Title>
        <Paragraph>
          这个页面展示了Markdown渲染系统的各种扩展功能，包括Mermaid图表、数学公式、表格和代码高亮等。
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%', }}>
          <Card title="功能设置">
            <Space>
              <span>主题:</span>
              <Select
                value={currentTheme}
                onChange={handleThemeChange}
                style={{ width: 120 }}
              >
                <Option value={ThemeName.LIGHT}>浅色</Option>
                <Option value={ThemeName.DARK}>深色</Option>
                <Option value={ThemeName.SEPIA}>护眼</Option>
              </Select>

              <span>启用目录:</span>
              <Switch
                checked={config.enableToc}
                onChange={checked => setConfig(prev => ({ ...prev, enableToc: checked }))}
              />

              <span>启用数学公式:</span>
              <Switch
                checked={config.enableMath}
                onChange={checked => setConfig(prev => ({ ...prev, enableMath: checked }))}
              />

              <span>启用GFM:</span>
              <Switch
                checked={config.enableGfm}
                onChange={checked => setConfig(prev => ({ ...prev, enableGfm: checked }))}
              />
            </Space>
          </Card>

          <div
            style={{
              position: 'sticky',
              top: 64,
              zIndex: 1000,
              width: '100%'
            }}
          >
            <Tabs
              activeKey={activeTab} onChange={setActiveTab}
            >
              <TabPane tab="综合示例" key="combined" />
              <TabPane tab="Mermaid图表" key="mermaid" />
              <TabPane tab="数学公式" key="math" />
              <TabPane tab="表格" key="table" />
              <TabPane tab="代码块" key="code" />
            </Tabs>
          </div>

          {activeTab === 'mermaid' && (
            <Card title="Mermaid直接渲染测试">
              <MermaidTest />
            </Card>
          )}

          <Card title="Markdown编辑器" style={{ marginBottom: '20px' }}>
            <MarkdownEditor
              initialMarkdown={getExampleContent()}
              theme={currentTheme}
              readOnly={false}
            />
          </Card>

          <Card title="渲染结果">
            <MarkdownRenderer
              content={getExampleContent()}
              allowHtml={!config.enableSanitize}
              linkTarget={config.linkTarget}
              className="markdown-body"
            />
          </Card>

          <Card title="性能监控">
            <PerformancePanel />
          </Card>

          <Card title="独立组件展示">
            <Title level={4}>代码块组件</Title>
            <CodeBlock
              inline={false}
              className="language-javascript"
              theme={currentTheme === ThemeName.DARK ? 'dark' : 'light'}
            >
              {`function example() {\n  console.log("这是一个代码块组件示例");\n  return "Hello World";\n}`}
            </CodeBlock>

            <Title level={4} style={{ marginTop: '20px' }}>Mermaid图表组件</Title>
            <MermaidDiagram
              chart={`graph TD\n  A[开始] --> B{判断}\n  B -->|是| C[处理]\n  B -->|否| D[结束]\n  C --> D`}
              theme={currentTheme === ThemeName.DARK ? 'dark' : 'default'}
              initialView="both"
            />
          </Card>
        </Space>
      </div>
    </>
  );
};

export default MarkdownDemoPage;