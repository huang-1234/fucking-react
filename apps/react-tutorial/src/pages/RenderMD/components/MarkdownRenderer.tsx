import React, { useEffect, useRef, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import CodeBlock from './CodeBlock';
import MermaidDiagram from './MermaidDiagram';
import type { MarkdownRendererProps, CustomComponents } from '../types/markdown';
// 不需要直接导入主题，因为我们使用DOM属性检测
import type { Heading } from '../types/markdown';
import { sanitizeSchema } from '../utils/sanitizeSchema';
import { markdownConfig } from '../config/markdownConfig';
import markdownCache from '../utils/cache';
import { performanceMonitor } from '../tools/performance';
import { produce } from 'immer';
import styles from './MarkdownRenderer.module.less';

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  allowHtml = false,
  linkTarget = '_blank',
  allowedElements = sanitizeSchema.tagNames,
  skipHtml = false,
  onHeadingsChange,
  ...props
}) => {
  const headingsRef = useRef<Heading[]>([]);
  const markdownRef = useRef<HTMLDivElement>(null);
  const [cachedHtml, setCachedHtml] = useState<string | null>(null);

  // 生成缓存键
  const cacheKey = useMemo(() => {
    return `${content}_${allowHtml}_${linkTarget}_${skipHtml}`;
  }, [content, allowHtml, linkTarget, skipHtml]);

  // 检查缓存
  useEffect(() => {
    performanceMonitor.start('check_cache');
    // 如果启用了缓存，尝试从缓存中获取
    const cached = markdownCache.getCachedMarkdown(cacheKey);
    if (cached) {
      setCachedHtml(cached);
      performanceMonitor.end('check_cache');
      performanceMonitor.start('render_from_cache');
      performanceMonitor.end('render_from_cache');
    } else {
      setCachedHtml(null);
      performanceMonitor.end('check_cache');
    }
  }, [cacheKey]);

  // 使用useMemo提取标题，避免重复计算
  const extractedHeadings = useMemo(() => {
    if (!onHeadingsChange) return [];

    performanceMonitor.start('extract_headings');
    const regex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(regex));

    // 使用Immer创建标题列表
    const headingList = produce([] as Heading[], draft => {
      matches.forEach(match => {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        draft.push({ id, text, level });
      });
    });

    performanceMonitor.end('extract_headings');
    return headingList;
  }, [content, onHeadingsChange]);

  // 更新引用和通知父组件
  useEffect(() => {
    if (extractedHeadings.length > 0 && onHeadingsChange) {
      headingsRef.current = extractedHeadings;
      onHeadingsChange(extractedHeadings);
    }
  }, [extractedHeadings, onHeadingsChange]);

  // 缓存渲染结果
  useEffect(() => {
    // 如果已经渲染完成，且不是使用的缓存内容，则缓存结果
    if (markdownRef.current && !cachedHtml) {
      performanceMonitor.start('cache_result');
      const html = markdownRef.current.innerHTML;
      markdownCache.cacheMarkdown(cacheKey, html);
      performanceMonitor.end('cache_result');
    }
  }, [cacheKey, cachedHtml]);

  // 自定义组件配置
  const components: CustomComponents = useMemo(() => ({
    h1: ({ children, ...props }) => {
      const id = `heading-${String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      return (
        <h1 id={id} className="text-3xl font-bold mb-6 mt-8 border-b pb-2 dark:border-gray-700" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const id = `heading-${String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      return (
        <h2 id={id} className="text-2xl font-semibold mb-4 mt-6 border-b pb-1 dark:border-gray-700" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const id = `heading-${String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      return (
        <h3 id={id} className="text-xl font-medium mb-3 mt-5" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }) => {
      const id = `heading-${String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
      return (
        <h4 id={id} className="text-lg font-medium mb-2 mt-4" {...props}>
          {children}
        </h4>
      );
    },
    p: ({ children, ...props }) => (
      <p className="mb-4 leading-7 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </p>
    ),
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target={linkTarget}
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
        {...props}
      >
        {children}
      </a>
    ),
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      // 检测是否为Mermaid图表
      if (language === 'mermaid') {
        // 使用当前文档的主题
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        return <MermaidDiagram chart={codeString} theme={currentTheme === 'dark' ? 'dark' : 'default'} />;
      }

      return (
        <CodeBlock
          inline={inline}
          className={className}
          {...props}
        >
          {children}
        </CodeBlock>
      );
    },
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </td>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-blue-500 italic my-4 pl-4 text-gray-600 dark:text-gray-400" {...props}>
        {children}
      </blockquote>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    img: ({ src, alt, ...props }) => (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto my-4 rounded"
        loading="lazy"
        {...props}
      />
    )
  }), [linkTarget]);

  // 构建rehype插件列表
  const rehypePlugins = useMemo(() => {
    const plugins = [];

    if (allowHtml) {
      plugins.push(rehypeRaw);
    }

    plugins.push([rehypeSanitize, sanitizeSchema]);
    plugins.push([rehypeExternalLinks, { target: linkTarget, rel: ['nofollow', 'noopener', 'noreferrer'] }]);

    return plugins;
  }, [allowHtml, linkTarget]);

  // 渲染计时 - 将hooks移到条件判断之前
  useEffect(() => {
    // 只有在非缓存模式下才需要计时
    if (!cachedHtml) {
      performanceMonitor.start('markdown_render');

      // 在组件渲染完成后结束计时
      if (markdownRef.current) {
        performanceMonitor.end('markdown_render');
      }
    }
  }, [cachedHtml]);

  // 如果有缓存，直接使用缓存的HTML
  if (cachedHtml) {
    return (
      <div
        className={`${styles.markdownContainer} ${className}`}
        dangerouslySetInnerHTML={{ __html: cachedHtml }}
      />
    );
  }

  return (
    <div ref={markdownRef} className={`${styles.markdownContainer} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins as any}
        components={components}
        skipHtml={skipHtml}
        allowedElements={allowedElements}
        urlTransform={markdownConfig.transformLinkUri}
        {...props}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(MarkdownRenderer);