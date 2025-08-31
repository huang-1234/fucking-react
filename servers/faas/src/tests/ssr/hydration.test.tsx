/**
 * 客户端激活(Hydration)测试
 * 测试服务端渲染后的客户端激活过程
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createDOMEnvironment } from '../../server/dom-simulator';
import { Router } from '../../shared/router';
import { AppProvider } from '../../shared/store';
import App from '../../shared/App';
import pkg from 'react-helmet-async';
import { AppState } from '@/shared/store/index';
const { HelmetProvider } = pkg;

describe('客户端激活(Hydration)测试', () => {
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

  let cleanup: () => void;
  let container: HTMLElement;

  beforeEach(() => {
    // 使用vi.mock模拟DOM环境
    vi.mock('../../server/dom-simulator', () => ({
      createDOMEnvironment: vi.fn(() => ({
        cleanup: vi.fn(),
        window: global.window,
        document: global.document
      }))
    }));

    // 模拟document和container
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root') as HTMLElement;

    // 模拟window.__PRELOADED_STATE__
    window.__PRELOADED_STATE__ = initialState;

    // 提供一个空的清理函数
    cleanup = () => {};
  });

  afterEach(() => {
    // 清理DOM环境
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    delete window.__PRELOADED_STATE__;
    if (cleanup) cleanup();
  });

  it('应该能够成功激活(hydrate)服务端渲染的内容', () => {
    // 服务端渲染
    const helmetContext = {};
    const serverApp = (
      <HelmetProvider context={helmetContext}>
        <AppProvider initialState={initialState as Partial<AppState>}>
          <Router location="/">
            <App />
          </Router>
        </AppProvider>
      </HelmetProvider>
    );
    const serverHtml = renderToString(serverApp);

    // 设置服务端渲染的HTML
    container.innerHTML = serverHtml;

    // 监听控制台错误
    const consoleSpy = vi.spyOn(console, 'error');

    // 客户端激活
    const root = hydrateRoot(
      container,
      <HelmetProvider>
        <AppProvider initialState={initialState as Partial<AppState>}>
          <Router>
            <App />
          </Router>
        </AppProvider>
      </HelmetProvider>
    );

    // 验证没有激活错误
    expect(consoleSpy).not.toHaveBeenCalled();

    // 验证内容
    expect(container.innerHTML).toContain('React 19 SSR');
    expect(container.innerHTML).toContain('测试标题');

    // 清理
    consoleSpy.mockRestore();
    root.unmount();
  });

  it('应该能够处理服务端渲染错误并降级为客户端渲染', () => {
    // 模拟SSR错误
    window.__SSR_ERROR__ = true;

    // 设置空的容器
    container.innerHTML = '<div></div>';

    // 监听控制台警告
    const consoleSpy = vi.spyOn(console, 'warn');

    // 客户端渲染
    const root = createRoot(container);
    root.render(
      <HelmetProvider>
        <AppProvider initialState={initialState as Partial<AppState>}>
          <Router>
            <App />
          </Router>
        </AppProvider>
      </HelmetProvider>
    );

    // 验证警告信息
    expect(consoleSpy).toHaveBeenCalledWith('服务端渲染失败，降级为客户端渲染');

    // 验证内容
    expect(container.innerHTML).toContain('React 19 SSR');

    // 清理
    delete window.__SSR_ERROR__;
    consoleSpy.mockRestore();
    root.unmount();
  });
});
