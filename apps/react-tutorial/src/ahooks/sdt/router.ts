import { useLocation, useNavigate, useMatch } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export interface UseRouteListenerOptions {
  onRouteChange?: () => void;
  watchParams?: boolean;
  enablePreventLeave?: boolean;
  debug?: boolean;
}

export interface RouteInfo {
  from: string;
  to: string;
  searchParams: URLSearchParams;
  state: any;
  timestamp: number;
  type?: string;
}

/**
 * 监听路由变化的自定义Hook
 * @param {Object} options 配置选项
 * @param {Function} options.onRouteChange 路由变化时的回调函数
 * @param {Array} options.watchParams 是否观察参数变化
 * @param {boolean} options.enablePreventLeave 是否启用离开页面阻止
 * @returns {Object} 路由控制方法和当前状态
 */
export const useRouteListener = (options: UseRouteListenerOptions = {}) => {
  const {
    onRouteChange = (routeInfo: RouteInfo) => { },
    watchParams = false,
    enablePreventLeave = false,
    debug = true
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch(location.pathname);
  const previousPath = useRef(location.pathname);
  const isBlocked = useRef(false);

  // 路由变化处理
  useEffect(() => {
    // 仅当路径真正变化时触发
    if (previousPath.current !== location.pathname) {
      const routeInfo = {
        from: previousPath.current,
        to: location.pathname,
        searchParams: new URLSearchParams(location.search),
        state: location.state,
        timestamp: Date.now()
      };

      onRouteChange(routeInfo as RouteInfo);
      previousPath.current = location.pathname;
    }
  }, [location.pathname, onRouteChange]);

  // 参数变化处理（可选）
  useEffect(() => {
    if (watchParams) {
      const paramInfo = {
        path: location.pathname,
        search: location.search,
        params: match ? match.params : {},
        state: location.state
      };

      onRouteChange({ type: 'PARAMS_CHANGE', ...paramInfo } as unknown as RouteInfo);
    }
  }, [watchParams ? location.search : null, watchParams ? location.state : null]);

  // 页面离开阻止
  useEffect(() => {
    if (!enablePreventLeave) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isBlocked.current) {
        event.preventDefault();
        event.returnValue = ''; // 标准方法
        return ''; // 兼容旧浏览器
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isBlocked.current && !window.confirm('确定要离开当前页面吗？未保存的数据可能会丢失')) {
        window.history.pushState(null, '', window.location.href);
        // 需要额外的逻辑来处理导航阻止
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enablePreventLeave]);

  // 提供控制方法
  const blockNavigation = (shouldBlock: boolean) => {
    isBlocked.current = shouldBlock;
  };

  const navigateWithRecord = (to: string | { pathname: string }, options: { state?: any } = {}) => {
    const record = {
      from: location.pathname,
      to: typeof to === 'string' ? to : to.pathname,
      timestamp: Date.now(),
      state: options.state
    };

    // 在实际应用中，这里可以发送统计信息
    debug && console.log('导航记录:', record);

    navigate(to, options);
  };

  return {
    currentPath: location.pathname,
    previousPath: previousPath.current,
    searchParams: new URLSearchParams(location.search),
    routeState: location.state,
    blockNavigation,
    navigate: navigateWithRecord,
    isBlocked: isBlocked.current
  };
};
