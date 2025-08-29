/**
 * 客户端入口文件
 * 用于客户端激活(Hydration)
 */
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from '../shared/App';
import { AppProvider } from '../shared/store';
import { Router } from '../shared/router';

// 获取预加载的状态
const preloadedState = window.__PRELOADED_STATE__ || {};

// 删除预加载状态，避免XSS攻击
delete window.__PRELOADED_STATE__;

/**
 * 客户端激活函数
 * 使用React的hydrateRoot API进行客户端激活
 */
const hydrate = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('找不到根元素 #root');
    return;
  }

  // 使用hydrateRoot API进行激活
  const root = hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <AppProvider initialState={preloadedState}>
          <Router>
            <App />
          </Router>
        </AppProvider>
      </HelmetProvider>
    </React.StrictMode>
  );

  // 移除服务端注入的样式
  const removeServerStyles = () => {
    const ssrStyles = document.getElementById('ssr-styles');
    if (ssrStyles && ssrStyles.parentNode) {
      ssrStyles.parentNode.removeChild(ssrStyles);
    }
  };

  // 在激活完成后移除服务端样式
  setTimeout(removeServerStyles, 0);

  return root;
};

// 执行客户端激活
const root = hydrate();

// 热更新支持
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept();
}

// 如果发生SSR错误，则显示错误信息
if (window.__SSR_ERROR__) {
  console.warn('服务端渲染失败，降级为客户端渲染');
}

// 导出客户端根实例，用于测试
export default root;

// 声明全局变量
declare global {
  interface Window {
    __PRELOADED_STATE__: any;
    __SSR_ERROR__?: boolean;
  }
}