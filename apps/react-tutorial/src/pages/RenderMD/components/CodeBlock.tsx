import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import type { CodeBlockProps } from '../types/markdown';
import styles from './CodeBlock.module.less';

interface CodeBlockComponentProps extends CodeBlockProps {
  theme?: string;
}

const CodeBlock: React.FC<CodeBlockComponentProps> = ({
  inline,
  className,
  children,
  theme = 'light',
  language: languageProps,
  code,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : languageProps || '';
  const codeString = code || String(children).replace(/\n$/, '') || 'markdown';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const currentTheme = theme === 'dark' ? oneDark : oneLight;

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLanguage}>
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label="复制代码"
        >
          {copied ? (
            <Check size={16} className={styles.successIcon} />
          ) : (
            <Copy size={16} className={styles.copyIcon} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={currentTheme}
        language={language || 'text'}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          fontSize: '14px',
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default React.memo(CodeBlock);