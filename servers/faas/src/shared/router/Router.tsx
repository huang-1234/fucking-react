/**
 * 同构路由组件
 * 根据运行环境自动选择适合的路由器
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

interface RouterProps {
  children: React.ReactNode;
  location?: string;
}

/**
 * 同构路由组件
 * 在客户端使用 BrowserRouter，在服务端使用 StaticRouter
 */
const Router: React.FC<RouterProps> = ({ children, location }) => {
  // 判断当前环境
  const isServer = typeof window === 'undefined';

  // 根据环境选择合适的路由器
  if (isServer) {
    return <StaticRouter location={location || '/'}>{children}</StaticRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

export default Router;
