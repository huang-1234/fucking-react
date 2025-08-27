import { useState, useEffect } from 'react';
import type { MarkdownTheme } from '../types/markdown';
import { markdownThemes } from '../config/markdownConfig';

export const useTheme = (initialTheme: string = 'light') => {
  const [theme, setTheme] = useState<string>(initialTheme);
  const [themeConfig, setThemeConfig] = useState<MarkdownTheme>(markdownThemes[initialTheme as keyof typeof markdownThemes] || markdownThemes.light);

  useEffect(() => {
    // 如果用户首次访问，检查系统首选项
    if (initialTheme === 'light' && localStorage.getItem('md-theme') === null) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        setTheme('dark');
      }
    } else {
      // 从localStorage读取主题设置
      const savedTheme = localStorage.getItem('md-theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [initialTheme]);

  useEffect(() => {
    // 当主题改变时，更新主题配置
    const newThemeConfig = markdownThemes[theme as keyof typeof markdownThemes] || markdownThemes.light;
    setThemeConfig(newThemeConfig);

    // 保存到localStorage
    localStorage.setItem('md-theme', theme);

    // 更新文档根元素的data-theme属性，用于CSS变量
    document.documentElement.setAttribute('data-theme', theme);

    // 为深色主题添加dark类名到body
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme, themeConfig };
};

export default useTheme;
