import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Spin } from 'antd';
import { type LLMRichTextRendererProps, type ContentChunk, type StreamingConfig } from '../types';
import LLMCodeBlock from './LLMCodeBlock';
import StreamingText from './StreamingText';
import styles from './LLMRichTextRenderer.module.less';

/**
 * LLM富文本渲染器
 * 支持Markdown、代码高亮、数学公式和流式渲染
 */
const LLMRichTextRenderer: React.FC<LLMRichTextRendererProps> = ({
  content,
  isStreaming = false,
  streamingConfig = {},
  onRenderComplete,
  onChunkComplete,
  className = '',
  theme = 'light',
  allowHtml = false,
  enableMath = true,
  enableMermaid = true,
  enableGfm = true,
  renderPlaceholder = <Spin tip="正在生成内容..." />
}: LLMRichTextRendererProps) => {
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(!isStreaming);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [chunks, setChunks] = useState<ContentChunk[]>([]);

  // 默认流式渲染配置
  const defaultStreamingConfig: Partial<StreamingConfig> = {
    speed: 'normal',
    showCursor: true,
    cursorChar: '▋',
    delay: 0,
    ...streamingConfig
  };

  // 处理内容分块
  useEffect(() => {
    if (typeof content === 'string') {
      // 如果是字符串，直接设置为渲染内容
      setRenderedContent(content);
      setIsComplete(!isStreaming);
    } else if (Array.isArray(content)) {
      // 如果是数组，设置为分块内容
      setChunks(content);
      setCurrentChunkIndex(0);
      setIsComplete(false);
    }
  }, [content, isStreaming]);

  // 处理分块渲染完成
  const handleChunkComplete = (chunkId: string) => {
    if (onChunkComplete) {
      onChunkComplete(chunkId);
    }

    // 继续渲染下一个块
    setCurrentChunkIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= chunks.length) {
        // 所有块都渲染完成
        setIsComplete(true);
        if (onRenderComplete) {
          onRenderComplete();
        }
      }
      return nextIndex;
    });
  };

  // 构建rehype插件列表
  const rehypePlugins = useMemo(() => {
    const plugins = [];

    if (allowHtml) {
      plugins.push(rehypeRaw);
    }

    plugins.push([rehypeSanitize]);
    plugins.push([rehypeExternalLinks, { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] }]);

    if (enableMath) {
      plugins.push(rehypeKatex);
    }

    return plugins;
  }, [allowHtml, enableMath]);

  // 自定义组件配置
  const components = useMemo(() => ({
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      // 检测是否为Mermaid图表
      if (language === 'mermaid' && enableMermaid) {
        return (
          <div className={styles.mermaidContainer}>
            {isStreaming ? (
              <LLMCodeBlock
                language="mermaid"
                code={codeString}
                isStreaming={isStreaming && !isComplete}
                streamingConfig={defaultStreamingConfig}
                theme={theme}
              />
            ) : (
              <div className="mermaid">{codeString}</div>
            )}
          </div>
        );
      }

      if (inline) {
        return (
          <code className={className} {...props}>
            {isStreaming && !isComplete ? (
              <StreamingText
                text={codeString}
                speed={defaultStreamingConfig.speed}
                showCursor={false}
                isComplete={isComplete}
              />
            ) : (
              children
            )}
          </code>
        );
      }

      return (
        <LLMCodeBlock
          language={language}
          code={codeString}
          isStreaming={isStreaming && !isComplete}
          streamingConfig={defaultStreamingConfig}
          theme={theme}
        />
      );
    },
    p: ({ children, ...props }: any) => (
      <p className={styles.paragraph} {...props}>
        {isStreaming && !isComplete ? (
          <StreamingText
            text={String(children)}
            speed={defaultStreamingConfig.speed}
            showCursor={defaultStreamingConfig.showCursor}
            cursorChar={defaultStreamingConfig.cursorChar}
            delay={defaultStreamingConfig.delay}
            isComplete={isComplete}
          />
        ) : (
          children
        )}
      </p>
    ),
    // 其他组件可以根据需要添加
  }), [isStreaming, isComplete, defaultStreamingConfig, theme, enableMermaid]);

  // 渲染分块内容
  const renderChunks = () => {
    if (!chunks.length) return null;

    return chunks.slice(0, currentChunkIndex + 4).map((chunk, index) => {
      const isCurrentChunk = index === currentChunkIndex;
      const isChunkComplete = index < currentChunkIndex;

      // 只对当前块进行流式渲染，之前的块直接显示完整内容
      const shouldStreamRender = isStreaming && isCurrentChunk && !isChunkComplete;

      switch (chunk.type) {
        case 'code':
          return (
            <LLMCodeBlock
              key={chunk.id}
              language={chunk.metadata?.language || 'text'}
              code={chunk.content}
              isStreaming={shouldStreamRender}
              streamingConfig={defaultStreamingConfig}
              theme={theme}
              onComplete={() => handleChunkComplete(chunk.id)}
            />
          );
        case 'math':
          // 数学公式渲染
          return (
            <div key={chunk.id} className={styles.mathContainer}>
              {/* 使用KaTeX渲染数学公式 */}
              {chunk.content}
            </div>
          );
        case 'mermaid':
          // Mermaid图表渲染
          return (
            <div key={chunk.id} className={styles.mermaidContainer}>
              <div className="mermaid">{chunk.content}</div>
            </div>
          );
        case 'text':
        default:
          return (
            <div key={chunk.id} className={styles.textChunk}>
              {shouldStreamRender ? (
                <StreamingText
                  text={chunk.content}
                  speed={defaultStreamingConfig.speed}
                  showCursor={defaultStreamingConfig.showCursor}
                  cursorChar={defaultStreamingConfig.cursorChar}
                  delay={defaultStreamingConfig.delay}
                  onComplete={() => handleChunkComplete(chunk.id)}
                  isComplete={isChunkComplete}
                />
              ) : (
                <ReactMarkdown
                  remarkPlugins={enableGfm ? [remarkGfm] : []}
                  rehypePlugins={rehypePlugins as any}
                  components={components}
                >
                  {chunk.content}
                </ReactMarkdown>
              )}
            </div>
          );
      }
    });
  };

  // 如果没有内容，显示占位符
  if (!renderedContent && !chunks.length) {
    return (
      <div className={`${styles.llmRichTextRenderer} ${className}`}>
        {renderPlaceholder}
      </div>
    );
  }

  return (
    <div className={`${styles.llmRichTextRenderer} ${className} ${styles[theme]}`}>
      {chunks.length > 0 ? (
        renderChunks()
      ) : (
        <ReactMarkdown
          remarkPlugins={enableGfm ? [remarkGfm] : []}
          rehypePlugins={rehypePlugins as any}
          components={components}
        >
          {renderedContent}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default React.memo(LLMRichTextRenderer);
