import React, { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { performanceMonitor } from './tools/performance';
import { Layout, Card, Typography, Tabs, message } from 'antd';
import { BookOutlined, SettingOutlined, EditOutlined, LineChartOutlined } from '@ant-design/icons';
import PerformancePanel from './components/PerformancePanel';
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

  // 使用Immer优化配置更新逻辑
  const handleConfigChange = useCallback((newConfig: MarkdownConfig) => {
    performanceMonitor.start('config_update');

    // 只在配置真正变化时才更新状态
    if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
      setConfig(produce(draft => {
        // 只更新变化的属性，避免不必要的重新渲染
        Object.keys(newConfig).forEach(key => {
          if (draft[key as keyof MarkdownConfig] !== newConfig[key as keyof MarkdownConfig]) {
            (draft[key as keyof MarkdownConfig] as any) = newConfig[key as keyof MarkdownConfig];
          }
        });
      }));

      // 同步主题（如果变化）
      if (newConfig.theme !== theme) {
        setTheme(newConfig.theme);
      }

      message.success('配置已更新');
    }

    performanceMonitor.end('config_update');
  }, [config, theme]);

  // 处理标题变化
  const handleHeadingsChange = (newHeadings: Heading[]) => {
    setHeadings(newHeadings);
  };

  // 渲染Markdown内容
  const renderMarkdownContent = () => {
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
  };

  // 移除调试日志

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

        {config.enableToc && headings.length > 0 && (
          <Card title="目录导航" size="small" style={{ marginTop: '16px' }}>
            <TableOfContents headings={headings} affixed={false} />
          </Card>
        )}
      </Sider>

      {/* 右侧控制面板 */}
      <Sider
        width={300}
        theme={theme === 'dark' ? 'dark' : 'light'}
        style={{
          background: themeConfig.backgroundColor,
        }}
        className={styles.rightSidebar}
      >
        <Title level={4} className={styles.pageTitle} style={{ color: themeConfig.headingColor }}>
          控制面板
        </Title>

        <ControlPanel config={config} onChange={handleConfigChange} />
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
                  {renderMarkdownContent()}
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
                </div>
              </TabPane>

              <TabPane
                tab={<span><SettingOutlined />设置</span>}
                key="settings"
              >
                <Card title="Markdown渲染设置" className={styles.settingsContainer}>
                  <p>您可以在右侧控制面板中调整Markdown渲染设置。</p>
                </Card>
              </TabPane>

              <TabPane
                tab={<span><LineChartOutlined />性能</span>}
                key="performance"
              >
                <PerformancePanel />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default React.memo(MarkdownLearningPage);