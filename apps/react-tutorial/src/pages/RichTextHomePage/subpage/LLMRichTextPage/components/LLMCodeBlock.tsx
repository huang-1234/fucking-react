import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/ahooks/sdt';
import { type LLMCodeBlockProps } from '../types';
import StreamingText from './StreamingText';
import styles from './LLMCodeBlock.module.less';

/**
 * LLM代码块组件
 * 支持代码高亮和流式渲染
 */
const LLMCodeBlock: React.FC<LLMCodeBlockProps> = ({
  language,
  code,
  isStreaming = false,
  streamingConfig = {},
  onComplete,
  theme = 'dark'
}) => {
  const [copied, setCopied] = useState(false);
  const [isComplete, setIsComplete] = useState(!isStreaming);
  const { copy } = useClipboard();

  const {
    speed = 'normal',
    showCursor = true,
    cursorChar = '▋',
    delay = 0
  } = streamingConfig;

  const handleCopy = async () => {
    try {
      await copy(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleStreamingComplete = () => {
    setIsComplete(true);
    if (onComplete) {
      onComplete();
    }
  };

  // 如果代码变化，重置完成状态
  useEffect(() => {
    if (!isStreaming) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [code, isStreaming]);

  const currentTheme = theme === 'dark' ? oneDark : oneLight;

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

      {isStreaming && !isComplete ? (
        <div className={styles.streamingCodeContainer}>
          <pre className={styles.streamingCode}>
            <StreamingText
              text={code}
              speed={speed}
              showCursor={showCursor}
              cursorChar={cursorChar}
              delay={delay}
              onComplete={handleStreamingComplete}
              className={styles.streamingCodeText}
            />
          </pre>
        </div>
      ) : (
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
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default React.memo(LLMCodeBlock);
