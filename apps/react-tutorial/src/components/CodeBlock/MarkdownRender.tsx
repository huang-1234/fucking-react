import React from 'react';
import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './MarkdownRender.module.less';

const { Text } = Typography;

interface MarkdownRenderProps {
  code: string;
  language?: string;
}

/**
 * 代码块组件
 * 使用 react-markdown 显示格式化的代码
 * 支持语法高亮和 Markdown 格式
 */
export const MarkdownRender: React.FC<MarkdownRenderProps> = ({ code, language = 'jsx' }) => {
  // 确保代码是字符串类型
  let safeCode = '';

  if (typeof code === 'string') {
    safeCode = code;
  } else if (code === null || code === undefined) {
    safeCode = '';
  } else {
    // 处理非字符串类型
    try {
      safeCode = JSON.stringify(code, null, 2);
    } catch (e) {
      // 如果JSON序列化失败，尝试使用String()
      safeCode = String(code);
    }
  }

  // 检查是否包含[object Object]，如果包含则使用简单的pre标签显示
  const containsObjectNotation = safeCode.includes('[object Object]');

  // 如果不使用ReactMarkdown，直接返回pre标签
  if (containsObjectNotation) {
    return (
      <div className={styles.fallbackBlock}>
        <pre>
          <Text>
            <code>{safeCode}</code>
          </Text>
        </pre>
      </div>
    );
  }

  // 将代码包装成 Markdown 格式
  const markdownCode = `\`\`\`${language}\n${safeCode}\n\`\`\``;

  return (
    <div className={styles.MarkdownRenderWrapper}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props || {};
            const match = /language-(\w+)/.exec(className || '');

            // 确保children是字符串
            const codeContent = React.Children.toArray(children)
              .map(child => typeof child === 'string' ? child : '')
              .join('');

            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={dark}
              >
                {codeContent.replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            )
          }
        }}
      >
        {markdownCode}
      </ReactMarkdown>
    </div>
  );
};