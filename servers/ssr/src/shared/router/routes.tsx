/**
 * 路由配置
 * 前后端共享的路由定义
 */
import React from 'react';
import { RouteObject } from 'react-router-dom';

// 路由类型定义（扩展自 react-router-dom 的 RouteObject）
export interface AppRouteObject extends RouteObject {
  // 数据预取函数，用于SSR
  fetchData?: (params: any) => Promise<any>;
  // 是否需要认证
  requireAuth?: boolean;
  // 元数据
  meta?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  // 子路由
  children?: AppRouteObject[];
}

// 懒加载组件
const Home = React.lazy(() => import('../../components/Home'));
const About = React.lazy(() => import('../../components/About'));
const NotFound = React.lazy(() => import('../../components/NotFound'));

// 路由配置
const routes: AppRouteObject[] = [
  {
    path: '/',
    element: <Home />,
    meta: {
      title: '首页',
      description: 'React 19 SSR 演示首页'
    },
    fetchData: async () => {
      // 模拟数据获取
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            title: 'React 19 SSR 演示',
            subtitle: '使用React 19、Koa和TypeScript实现的高性能SSR应用',
            content: '这是一个使用React 19、Koa和TypeScript实现的高性能SSR应用'
          });
        }, 100);
      });
    }
  },
  {
    path: '/about',
    element: <About />,
    meta: {
      title: '关于我们',
      description: '关于React 19 SSR演示项目'
    }
  },
  {
    path: '*',
    element: <NotFound />,
    meta: {
      title: '页面未找到',
      description: '404 - 页面未找到'
    }
  }
];

export default routes;
