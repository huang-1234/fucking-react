'use client';

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { useState, useEffect } from 'react';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// 预置 Next.js 环境
const nextScope = {
  // 这里可以添加一些预置的 Next.js 相关函数或组件
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} style={{ color: 'blue', textDecoration: 'underline' }}>{children}</a>
  ),
  Image: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: '100%' }} />
  ),
};

interface LiveDemoProps {
  code: string;
}

export default function LiveDemo({ code }: LiveDemoProps) {
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
    <LiveProvider
      code={code}
      scope={{ ...nextScope, useState, useEffect }}
      noInline={true}
      theme={isDarkMode ? vscDarkPlus : vs}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium">编辑代码</h3>
          </div>
          <LiveEditor
            className="font-mono text-sm p-4"
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f8f8',
            }}
          />
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium">预览效果</h3>
          </div>
          <div className="p-4">
            <LivePreview />
            <LiveError className="text-red-500 mt-2 text-sm" />
          </div>
        </div>
      </div>
    </LiveProvider>
  );
}
