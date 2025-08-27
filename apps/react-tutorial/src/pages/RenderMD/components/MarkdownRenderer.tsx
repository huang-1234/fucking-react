import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import CodeBlock from './CodeBlock';
import type { MarkdownRendererProps, CustomComponents } from '../types/markdown';
import type { Heading } from '../types/markdown';
import { sanitizeSchema } from '../utils/sanitizeSchema';
import { markdownConfig } from '../config/markdownConfig';
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

  // 提取标题并生成目录
  useEffect(() => {
    if (onHeadingsChange) {
      const regex = /^(#{1,6})\s+(.+)$/gm;
      const matches = Array.from(content.matchAll(regex));
      const headingList: Heading[] = matches.map((match) => {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        return { id, text, level };
      });
      headingsRef.current = headingList;
      onHeadingsChange(headingList);
    }
  }, [content, onHeadingsChange]);

  // 自定义组件配置
  const components: CustomComponents = {
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
    code: ({ inline, className, children, ...props }) => (
      <CodeBlock
        inline={inline}
        className={className}
        {...props}
      >
        {children}
      </CodeBlock>
    ),
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
  };

  // 构建rehype插件列表
  const rehypePlugins = [];

  if (allowHtml) {
    rehypePlugins.push(rehypeRaw);
  }

  rehypePlugins.push([rehypeSanitize, sanitizeSchema]);
  rehypePlugins.push([rehypeExternalLinks, { target: linkTarget, rel: ['nofollow', 'noopener', 'noreferrer'] }]);

  return (
    <div className={`${styles.markdownContainer} ${className}`}>
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