import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Switch, Select, Button, Divider, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import LLMRichTextRenderer from './components/LLMRichTextRenderer';
import LLMMarkdownEditor from './components/LLMMarkdownEditor';
import type { StreamingConfig } from './types';
import { demoMarkdown, demoChunks } from './utils/demoContent';
import styles from './index.module.less';
const { Option } = Select;

enum ActiveTab {
  streaming = 'streaming',
  chunks = 'chunks',
  editor = 'editor'
}
/**
 * LLM富文本页面
 * 展示大模型流式渲染的各种效果
 */
const LLMRichTextPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.streaming);
  const [markdownContent, setMarkdownContent] = useState<string>(demoMarkdown);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [streamingConfig, setStreamingConfig] = useState<StreamingConfig>({
    enabled: true,
    speed: 'normal',
    showCursor: true,
    cursorChar: '▋',
    delay: 0
  });

  // 切换主题时更新文档主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 处理流式渲染配置变更
  const handleStreamingConfigChange = (key: keyof StreamingConfig, value: any) => {
    setStreamingConfig(prev => ({ ...prev, [key]: value }));
  };

  // 处理预览按钮点击
  const handlePreview = (content: string) => {
    setMarkdownContent(content);
    setIsPreview(true);
  };

  // 处理渲染完成
  const handleRenderComplete = () => {
    message.success('内容渲染完成');
  };

  // 处理分块渲染完成
  const handleChunkComplete = (chunkId: string) => {
    console.log(`Chunk ${chunkId} rendered`);
  };

  // 重置演示
  const resetDemo = () => {
    setIsStreaming(true);
    setIsPreview(false);
  };

  return (
    <div className={`${styles.llmRichTextPage} ${styles[theme]}`}>
      <Card title="LLM富文本渲染演示" className={styles.mainCard}>
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey as ActiveTab)}
          className={styles.tabs}
          items={[{
            label: '流式渲染',
            key: ActiveTab.streaming,
          }, {
            label: '分块渲染',
            key: ActiveTab.chunks,
          }, {
            label: '编辑器',
            key: ActiveTab.editor,
          }]}
        >

        </Tabs>

        <div className={styles.controlPanel}>
          <Space>
            <span>主题:</span>
            <Select value={theme} onChange={setTheme} style={{ width: 100 }}>
              <Option value="light">浅色</Option>
              <Option value="dark">深色</Option>
              <Option value="sepia">护眼</Option>
            </Select>

            {(activeTab === ActiveTab.streaming || activeTab === ActiveTab.chunks) && (
              <>
                <Divider type="vertical" />
                <span>流式渲染:</span>
                <Switch
                  checked={streamingConfig.enabled}
                  onChange={value => handleStreamingConfigChange('enabled', value)}
                />

                {streamingConfig.enabled && (
                  <>
                    <span>速度:</span>
                    <Select
                      value={streamingConfig.speed}
                      onChange={value => handleStreamingConfigChange('speed', value)}
                      style={{ width: 100 }}
                    >
                      <Option value="slow">慢速</Option>
                      <Option value="normal">正常</Option>
                      <Option value="fast">快速</Option>
                    </Select>

                    <span>显示光标:</span>
                    <Switch
                      checked={streamingConfig.showCursor}
                      onChange={value => handleStreamingConfigChange('showCursor', value)}
                    />
                  </>
                )}

                <Divider type="vertical" />
                <Button
                  type="primary"
                  icon={isStreaming ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setIsStreaming(!isStreaming)}
                >
                  {isStreaming ? '暂停' : '继续'}
                </Button>
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={resetDemo}
                >
                  重置
                </Button>
              </>
            )}
          </Space>
        </div>

        <div className={styles.contentContainer}>
          {activeTab === ActiveTab.streaming && (
            <LLMRichTextRenderer
              content={markdownContent}
              isStreaming={isStreaming && streamingConfig.enabled}
              streamingConfig={streamingConfig}
              onRenderComplete={handleRenderComplete}
              theme={theme}
              enableMath={true}
              enableMermaid={true}
              enableGfm={true}
              className={styles.renderer}
              language="markdown"
              code={markdownContent}
            />
          )}

          {activeTab === ActiveTab.chunks && (
            <LLMRichTextRenderer
              content={demoChunks}
              isStreaming={isStreaming && streamingConfig.enabled}
              streamingConfig={streamingConfig}
              onRenderComplete={handleRenderComplete}
              onChunkComplete={handleChunkComplete}
              theme={theme}
              enableMath={true}
              enableMermaid={true}
              enableGfm={true}
              className={styles.renderer}
              language="markdown"
              code={markdownContent}
            />
          )}

          {activeTab === ActiveTab.editor && (
            <div className={styles.editorContainer}>
              <div className={styles.editorPanel}>
                <LLMMarkdownEditor
                  initialValue={markdownContent}
                  onChange={setMarkdownContent}
                  onPreview={handlePreview}
                  height={500}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>

              {isPreview && (
                <div className={styles.previewPanel}>
                  <div className={styles.previewHeader}>
                    <h3>预览</h3>
                    <Button size="small" onClick={() => setIsPreview(false)}>关闭</Button>
                  </div>
                  <LLMRichTextRenderer
                    content={markdownContent}
                    isStreaming={false}
                    theme={theme}
                    enableMath={true}
                    enableMermaid={true}
                    enableGfm={true}
                    className={styles.renderer}
                    language="markdown"
                    code={markdownContent}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(LLMRichTextPage);