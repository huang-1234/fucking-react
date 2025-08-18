'use client';

import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useEffect, useState } from 'react';

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 检测系统暗色模式
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    // 监听系统暗色模式变化
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  return (
    <SyntaxHighlighter
      language={language}
      style={isDarkMode ? vscDarkPlus : vs}
      showLineNumbers
      customStyle={{
        fontSize: '0.85rem',
        borderRadius: '6px',
        margin: '1.5rem 0',
      }}
    >
      {value}
    </SyntaxHighlighter>
  );
}
