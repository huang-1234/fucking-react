/**
 * 路由导出文件
 */
export { default as Router } from './Router';
export { default as routes } from './routes';
export * from './routes';

/**
 * 根据URL匹配路由
 */
import { matchPath } from 'react-router-dom';
import routes, { AppRouteObject } from './routes';

/**
 * 匹配当前URL的路由
 */
export const matchRoute = (url: string): AppRouteObject | undefined => {
  const path = url.split('?')[0];

  // 遍历所有路由
  for (const route of routes) {
    const match = matchPath(route.path || '', path);
    if (match) {
      return route;
    }

    // 检查子路由
    if (route.children) {
      for (const childRoute of route.children) {
        const fullPath = route.path ? `${route.path}${childRoute.path}` : childRoute.path;
        const childMatch = matchPath(fullPath || '', path);
        if (childMatch) {
          return childRoute;
        }
      }
    }
  }

  // 返回404路由
  return routes.find(route => route.path === '*');
};
