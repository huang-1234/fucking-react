import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MarkdownTheme } from '../types/markdown';
import { markdownThemes } from '../config/markdownConfig';

// 防抖函数 - 避免频繁更新DOM
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export const useTheme = (initialTheme: string = 'light') => {
  const [theme, setThemeState] = useState<string>(initialTheme);
  const [themeConfig, setThemeConfig] = useState<MarkdownTheme>(
    markdownThemes[initialTheme as keyof typeof markdownThemes] || markdownThemes.light
  );

  // 使用useMemo缓存主题配置
  const availableThemes = useMemo(() => Object.keys(markdownThemes), []);

  // 优化主题设置函数，使用useCallback
  const setTheme = useCallback((newTheme: string) => {
    // 验证主题是否有效
    if (!availableThemes.includes(newTheme)) {
      console.warn(`Theme "${newTheme}" not found, using "light" instead`);
      newTheme = 'light';
    }

    setThemeState(newTheme);
  }, [availableThemes]);

  // 初始化主题
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
      if (savedTheme && availableThemes.includes(savedTheme)) {
        setTheme(savedTheme);
      }
    }
  }, [initialTheme, setTheme, availableThemes]);

  // 使用防抖优化DOM更新
  const updateDomTheme = useCallback(debounce((newTheme: string) => {
    // 更新文档根元素的data-theme属性，用于CSS变量
    document.documentElement.setAttribute('data-theme', newTheme);

    // 为深色主题添加dark类名到body
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, 50), []);

  // 当主题改变时，更新主题配置
  useEffect(() => {
    // 使用requestAnimationFrame避免同步样式计算
    requestAnimationFrame(() => {
      const newThemeConfig = markdownThemes[theme as keyof typeof markdownThemes] || markdownThemes.light;
      setThemeConfig(newThemeConfig);

      // 保存到localStorage
      localStorage.setItem('md-theme', theme);

      // 使用防抖更新DOM
      updateDomTheme(theme);
    });
  }, [theme, updateDomTheme]);

  return { theme, setTheme, themeConfig };
};

export default useTheme;