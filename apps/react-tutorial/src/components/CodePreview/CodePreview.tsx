import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './CodePreview.module.less';

interface CodePreviewProps {
  children: string;
  lang?: string;
  showLineNumbers?: boolean;
}

/**
 * 代码预览组件
 * 用于在MDX文件中展示代码，支持语法高亮
 */
const CodePreview: React.FC<CodePreviewProps> = ({
  children,
  lang = "jsx",
  showLineNumbers = true
}) => {
  return (
    <div className={styles.codePreviewWrapper}>
      <SyntaxHighlighter
        language={lang}
        style={dracula}
        showLineNumbers={showLineNumbers}
        customStyle={{
          borderRadius: 8,
          padding: 16,
          margin: 0
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default React.memo(CodePreview);