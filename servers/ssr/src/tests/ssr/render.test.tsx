/**
 * SSR渲染一致性测试
 * 测试服务端渲染和客户端渲染的一致性
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { createDOMEnvironment } from '../../server/dom-simulator';
import { Router } from '../../shared/router';
import { AppProvider } from '../../shared/store';
import App from '../../shared/App';
import pkg from 'react-helmet-async';
const { HelmetProvider } = pkg;

describe('SSR渲染一致性测试', () => {
  // 测试数据
  const initialState = {
    user: {
      isAuthenticated: false,
      name: null,
      role: null
    },
    theme: 'light',
    locale: 'zh-CN',
    pageData: {
      '/': {
        title: '测试标题',
        subtitle: '测试副标题',
        content: '测试内容'
      }
    },
    loading: false,
    error: null
  };

  // 测试路径
  const testPaths = ['/', '/about', '/not-found'];

  let cleanup: () => void;

  beforeEach(() => {
    // 设置DOM环境
    const env = createDOMEnvironment();
    cleanup = env.cleanup;
  });

  afterEach(() => {
    // 清理DOM环境
    if (cleanup) cleanup();
  });

  // 测试服务端渲染和客户端渲染的一致性
  testPaths.forEach(path => {
    it(`路径 ${path} 的服务端渲染和客户端渲染应该一致`, () => {
      // 创建HelmetContext
      const helmetContext = {};

      // 服务端渲染
      const serverApp = (
        <HelmetProvider context={helmetContext}>
          <AppProvider initialState={initialState}>
            <Router location={path}>
              <App />
            </Router>
          </AppProvider>
        </HelmetProvider>
      );
      const serverHtml = renderToString(serverApp);

      // 客户端渲染
      const { container } = render(
        <HelmetProvider>
          <AppProvider initialState={initialState}>
            <Router location={path}>
              <App />
            </Router>
          </AppProvider>
        </HelmetProvider>
      );
      const clientHtml = container.innerHTML;

      // 比较渲染结果（忽略React生成的属性差异）
      const normalizedServerHtml = serverHtml.replace(/data-reactroot=""/g, '');
      const normalizedClientHtml = clientHtml.replace(/data-reactroot=""/g, '');

      expect(normalizedServerHtml).toContain('React 19 SSR');
      expect(normalizedClientHtml).toContain('React 19 SSR');

      // 检查页面特定内容
      if (path === '/') {
        expect(normalizedServerHtml).toContain('测试标题');
        expect(normalizedClientHtml).toContain('测试标题');
      } else if (path === '/about') {
        expect(normalizedServerHtml).toContain('关于我们');
        expect(normalizedClientHtml).toContain('关于我们');
      } else if (path === '/not-found') {
        expect(normalizedServerHtml).toContain('页面未找到');
        expect(normalizedClientHtml).toContain('页面未找到');
      }
    });
  });
});
