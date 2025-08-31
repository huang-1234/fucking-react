import React, { useState, useEffect, useMemo } from 'react';
import { CoreParser } from '../modules/core-parser';
import { RenderProcessor } from '../modules/renderer';
import { PluginManager } from '../modules/plugin';
import { TablePlugin, TaskListPlugin, TableOfContentsPlugin, FootnotePlugin } from '../modules/plugin/BuiltinPlugins';
import SyntaxHighlighter from '../modules/extensions/SyntaxHighlighter';
import MathRenderer from '../modules/extensions/MathRenderer';
import DiagramRenderer from '../modules/extensions/DiagramRenderer';
import { ThemeManager } from '../modules/theme/ThemeManager';
import { ThemeName } from '../modules/theme/ThemeDefinitions';
import { PerformanceMonitor } from '../modules/utils';
import './MarkdownEditor.less';
import WrapSplitter from './WrapSplitter';
import CodeBlock from './CodeBlock';

interface MarkdownEditorProps {
  /** @description 初始Markdown内容 */
  initialMarkdown?: string;
  /** @description 主题 */
  theme?: ThemeName;
  /** @description 是否只读 */
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = (props: MarkdownEditorProps) => {
  const { initialMarkdown = '# 欢迎使用 Markdown 编辑器\n\n这是一个示例文档。', theme = ThemeName.LIGHT, readOnly = false } = props || {};
  /** @description Markdown内容 */
  const [markdown, setMarkdown] = useState(initialMarkdown);
  /** @description 渲染内容 */
  const [renderedContent, setRenderedContent] = useState<string>('');
  /** @description 主题 */
  const [activeTheme, setActiveTheme] = useState<ThemeName>(theme);
  const [renderTime, setRenderTime] = useState<number>(0);

  // 初始化核心组件
  /** @description 核心解析器 */
  const coreParser = new CoreParser();
  /** @description 渲染处理器 */
  const renderProcessor = new RenderProcessor();
  const pluginManager = new PluginManager();
  /** @description 主题管理器 */
  const themeManager = new ThemeManager();
  /** @description 性能监控器 */
  const performanceMonitor = PerformanceMonitor.getInstance({
    enabled: true,
    logToConsole: true
  });

  // 注册内置插件
  useEffect(() => {
    // 注册内置插件
    /** @description 注册内置插件 */
    pluginManager.register(TablePlugin);
    /** @description 注册内置插件 */
    pluginManager.register(TaskListPlugin);
    /** @description 注册内置插件 */
    pluginManager.register(TableOfContentsPlugin);
    /** @description 注册内置插件 */
    pluginManager.register(FootnotePlugin);
    // 注册扩展插件
    /** @description 注册扩展插件 */
    const syntaxHighlighter = new SyntaxHighlighter();
    pluginManager.register(syntaxHighlighter.createPlugin());

    /** @description 注册扩展插件 */
    const mathRenderer = new MathRenderer();
    pluginManager.register(mathRenderer.createPlugin());

    /** @description 注册扩展插件 */
    const diagramRenderer = new DiagramRenderer();
    pluginManager.register(diagramRenderer.createPlugin());

    // 设置主题
    themeManager.setTheme(activeTheme);

    // 初始渲染
    renderMarkdown(markdown);

    // 清理函数
    return () => {
      // 卸载插件
      pluginManager.unregisterAll();
    };
  }, []);

  // 当主题变化时更新
  useEffect(() => {
    themeManager.setTheme(activeTheme);
  }, [activeTheme]);

  // 当Markdown内容变化时重新渲染
  useEffect(() => {
    renderMarkdown(markdown);
  }, [markdown]);

  // 渲染Markdown
  const renderMarkdown = async (text: string) => {
    performanceMonitor.mark('render_markdown');

    try {
      // 解析Markdown
      performanceMonitor.mark('parse');
      const ast = coreParser.parse(text);
      const parseTime = performanceMonitor.measure('parse');

      // 渲染HTML
      performanceMonitor.mark('render');
      const html = await renderProcessor.render(ast);
      const renderTimeValue = performanceMonitor.measure('render');

      // 更新状态
      setRenderedContent(html);
      setRenderTime((parseTime || 0) + (renderTimeValue || 0));
    } catch (error) {
      console.error('Error rendering markdown:', error);
      setRenderedContent(`<div class="error">渲染错误: ${error instanceof Error ? error.message : String(error)}</div>`);
    }

    performanceMonitor.measure('render_markdown');
  };

  // 切换主题
  const handleThemeChange = (newTheme: ThemeName) => {
    setActiveTheme(newTheme);
  };

  const leftPanel = useMemo(() => {
    if (!readOnly) {
      return <div className="editor-input">
        <CodeBlock
          language="markdown"
          code={markdown}
          onChange={(value: string) => setMarkdown(value)}
          placeholder="输入 Markdown 内容..."
          className="markdown-textarea"
          resizable={true}
          minHeight={800}
          maxHeight={1000}
          height="100%"
          width="100%"
        />
      </div>
    }
  }, []);
  const rightPanel = useMemo(() => {
    return <div className="editor-preview">
      <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  }, []);

  return (
    <div className={`markdown-editor theme-${activeTheme}`}>
      <WrapSplitter
        className="editor-container"
        style={{ minHeight: 600 }}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        defaultSizes={['50%', '50%']}
        defaultEnabled={true}
        onResize={() => { }}
        onReset={() => { }}
        header={<div className="editor-header">
          <div className="editor-title">Markdown 编辑器111</div>
          <div className="editor-controls">
            <select
              title='select'
              value={activeTheme}
              onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
              className="theme-selector"
            >
              <option value={ThemeName.LIGHT}>浅色主题</option>
              <option value={ThemeName.DARK}>深色主题</option>
              <option value={ThemeName.SEPIA}>护眼主题</option>
            </select>
            <div className="render-stats">
              渲染时间: {renderTime.toFixed(2)}ms
            </div>
          </div>
        </div>}
      >

      </WrapSplitter>
    </div>
  );
};

export default MarkdownEditor;
