/**
 * 客户端入口文件
 * 用于客户端激活(Hydration)
 */
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// 修复 CommonJS 模块导入问题
import pkg from 'react-helmet-async';
const { HelmetProvider } = pkg;
import App from '../shared/App';
import { AppProvider } from '../shared/store';

// 获取预加载的状态
const preloadedState = window.__PRELOADED_STATE__ || {};

// 删除预加载状态，避免XSS攻击
delete window.__PRELOADED_STATE__;

// 客户端激活
const hydrate = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('找不到根元素 #root');
    return;
  }

  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <AppProvider initialState={preloadedState}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

// 执行客户端激活
hydrate();

// 热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
}

// 声明全局变量
declare global {
  interface Window {
    __PRELOADED_STATE__: any;
    __SSR_ERROR__?: boolean;
  }
}