/**
 * 服务端入口文件
 * 用于SSR渲染
 */
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import App from './shared/App';
import { AppProvider, fetchInitialState } from './shared/store';
import routes from './shared/routes';
import { matchPath } from 'react-router-dom';

// 渲染函数类型
export interface RenderResult {
  App: React.ReactElement;
  head: {
    title: string;
    meta: string;
    links: string;
    scripts: string;
  };
  state: object;
}

/**
 * 匹配当前URL的路由
 */
const matchRoute = (url: string) => {
  const path = url.split('?')[0];
  return routes.find(route => matchPath(route.path, path));
};

/**
 * 服务端渲染函数
 * @param url 请求URL
 * @param context 上下文对象
 */
export async function render(url: string, context: any = {}): Promise<RenderResult> {
  // 匹配路由
  const route = matchRoute(url);

  // 获取初始状态
  let initialState = {};

  try {
    // 1. 获取全局初始状态
    const globalState = await fetchInitialState(url);

    // 2. 获取路由组件的数据
    let routeData = {};
    if (route && route.fetchData) {
      routeData = await route.fetchData({ url, ...context });
    }

    initialState = {
      ...globalState,
      pageData: {
        ...globalState.pageData,
        [url]: routeData
      }
    };
  } catch (error) {
    console.error('获取初始状态失败:', error);
    // 出错时使用空状态，避免渲染失败
  }

  // 用于收集头部信息
  const helmetContext = {};

  // 渲染应用
  const App = (
    <HelmetProvider context={helmetContext}>
      <AppProvider initialState={initialState}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </AppProvider>
    </HelmetProvider>
  );

  // 提取头部信息
  const { helmet } = helmetContext as { helmet: HelmetServerState };

  return {
    App,
    head: {
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      links: helmet.link.toString(),
      scripts: helmet.script.toString()
    },
    state: initialState
  };
}