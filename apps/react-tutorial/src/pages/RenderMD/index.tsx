import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Card, Typography, Tabs, message } from 'antd';
import { BookOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import MarkdownRenderer from './components/MarkdownRenderer';
import VirtualizedMarkdown from './components/VirtualizedMarkdown';
import ControlPanel from './components/ControlPanel';
import TableOfContents from './components/TableOfContents';
import { defaultMarkdownConfig } from './config/markdownConfig';
import type { Heading, MarkdownConfig } from './types/markdown';
import useTheme from './hooks/useTheme';
import MonacoEditor from '@monaco-editor/react';
import styles from './index.module.less';

// 导入示例Markdown内容
import exampleMarkdown from './tech.md?raw';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const MarkdownLearningPage: React.FC = () => {
  const [content, setContent] = useState<string>(exampleMarkdown);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [config, setConfig] = useState<MarkdownConfig>(defaultMarkdownConfig);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const { theme, setTheme, themeConfig } = useTheme(config.theme);

  // 同步主题设置
  useEffect(() => {
    setConfig(prev => ({ ...prev, theme }));
  }, [theme]);

  // 处理配置变更 - 使用useCallback优化
  const handleConfigChange = useCallback((newConfig: MarkdownConfig) => {
    // 只在配置真正变化时才更新状态
    if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
      setConfig(newConfig);

      // 只在主题变化时才更新主题
      if (newConfig.theme !== theme) {
        setTheme(newConfig.theme);
      }

      message.success('配置已更新');
    }
  }, [config, theme, setTheme]);

  // 处理标题变化 - 使用useCallback优化
  const handleHeadingsChange = useCallback((newHeadings: Heading[]) => {
    setHeadings(newHeadings);
  }, []);

  // 渲染Markdown内容 - 使用useMemo优化
  const renderedContent = useMemo(() => {
    // 根据配置决定是否使用虚拟滚动
    if (config.enableVirtualScroll && content.length > 5000) {
      return (
        <VirtualizedMarkdown
          content={content}
          allowHtml={true}
          linkTarget={config.linkTarget}
          skipHtml={!config.enableSanitize}
          onHeadingsChange={handleHeadingsChange}
        />
      );
    }

    return (
      <MarkdownRenderer
        content={content}
        allowHtml={true}
        linkTarget={config.linkTarget}
        skipHtml={!config.enableSanitize}
        onHeadingsChange={handleHeadingsChange}
      />
    );
  }, [content, config.enableVirtualScroll, config.linkTarget, config.enableSanitize, handleHeadingsChange]);

  // 优化编辑器组件 - 使用useMemo
  const editorComponent = useMemo(() => (
    <MonacoEditor
      language="markdown"
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      value={content}
      onChange={(value) => setContent(value || '')}
      options={{
        wordWrap: 'on',
        minimap: { enabled: true },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  ), [content, theme]);

  // 优化目录组件 - 使用useMemo
  const tocComponent = useMemo(() => {
    if (config.enableToc && headings.length > 0) {
      return (
        <Card title="目录导航" size="small" style={{ marginTop: '16px' }}>
          <TableOfContents headings={headings} affixed={false} />
        </Card>
      );
    }
    return null;
  }, [config.enableToc, headings]);

  return (
    <Layout className={styles.markdownPage}>
      <Sider
        width={300}
        theme={theme === 'dark' ? 'dark' : 'light'}
        style={{
          background: themeConfig.backgroundColor,
        }}
        className={styles.sidebar}
      >
        <Title level={3} className={styles.pageTitle} style={{ color: themeConfig.headingColor }}>
          Markdown渲染学习
        </Title>

        <ControlPanel config={config} onChange={handleConfigChange} />

        {tocComponent}
      </Sider>

      <Layout>
        <Content className={styles.content} style={{ background: themeConfig.backgroundColor }}>
          <Card
            bordered={false}
            style={{
              background: themeConfig.backgroundColor,
              color: themeConfig.textColor
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className={styles.tabContent}
            >
              <TabPane
                tab={<span><BookOutlined />预览</span>}
                key="preview"
              >
                <div
                  className={styles.previewContainer}
                  style={{
                    background: themeConfig.backgroundColor,
                    color: themeConfig.textColor,
                    borderColor: themeConfig.borderColor
                  }}
                >
                  {renderedContent}
                </div>
              </TabPane>

              <TabPane
                tab={<span><EditOutlined />编辑</span>}
                key="editor"
              >
                <div
                  className={styles.editorContainer}
                  style={{ borderColor: themeConfig.borderColor }}
                >
                  {editorComponent}
                </div>
              </TabPane>

              <TabPane
                tab={<span><SettingOutlined />设置</span>}
                key="settings"
              >
                <Card title="Markdown渲染设置" className={styles.settingsContainer}>
                  <ControlPanel config={config} onChange={handleConfigChange} />
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default React.memo(MarkdownLearningPage);