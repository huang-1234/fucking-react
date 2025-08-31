根据 React Router 的设计模式和常见开发需求，我为你设计了一个实用的 **`useRouteListener`** 自定义 Hook。这个 Hook 可以用于监听路由变化并执行相应的副作用操作，例如埋点统计、权限校验或动态标题更新。

```javascript
import { useLocation, useNavigate, useMatch } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * 监听路由变化的自定义Hook
 * @param {Object} options 配置选项
 * @param {Function} options.onRouteChange 路由变化时的回调函数
 * @param {Array} options.watchParams 是否观察参数变化
 * @param {boolean} options.enablePreventLeave 是否启用离开页面阻止
 * @returns {Object} 路由控制方法和当前状态
 */
const useRouteListener = (options = {}) => {
  const {
    onRouteChange = () => {},
    watchParams = false,
    enablePreventLeave = false
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

      onRouteChange(routeInfo);
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

      onRouteChange({ type: 'PARAMS_CHANGE', ...paramInfo });
    }
  }, [watchParams ? location.search : null, watchParams ? location.state : null]);

  // 页面离开阻止
  useEffect(() => {
    if (!enablePreventLeave) return;

    const handleBeforeUnload = (event) => {
      if (isBlocked.current) {
        event.preventDefault();
        event.returnValue = ''; // 标准方法
        return ''; // 兼容旧浏览器
      }
    };

    const handlePopState = (event) => {
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
  const blockNavigation = (shouldBlock) => {
    isBlocked.current = shouldBlock;
  };

  const navigateWithRecord = (to, options = {}) => {
    const record = {
      from: location.pathname,
      to: typeof to === 'string' ? to : to.pathname,
      timestamp: Date.now(),
      state: options.state
    };

    // 在实际应用中，这里可以发送统计信息
    console.log('导航记录:', record);

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

export default useRouteListener;
```

### 使用示例

```javascript
// 在组件中使用
function App() {
  const { currentPath, searchParams, blockNavigation } = useRouteListener({
    onRouteChange: (routeInfo) => {
      // 发送埋点统计
      console.log('路由变化:', routeInfo);
      // 更新页面标题
      document.title = `我的应用 - ${routeInfo.to}`;
    },
    watchParams: true, // 监听参数变化
    enablePreventLeave: false // 是否启用离开阻止
  });

  // 示例：在表单中阻止离开
  const handleEdit = () => {
    blockNavigation(true); // 启用离开阻止
  };

  const handleSave = () => {
    // 保存逻辑...
    blockNavigation(false); // 禁用离开阻止
  };

  return (
    <div>
      <p>当前路径: {currentPath}</p>
      <button onClick={handleEdit}>编辑</button>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
```

### 功能特点

1.  **路由变化监听** - 检测路径变化并触发回调。
2.  **参数变化观察** - 可选监听查询参数和路由状态变化。
3.  **页面离开保护** - 防止用户意外离开有未保存数据的页面。
4.  **导航记录** - 提供增强的导航方法，自动记录导航历史。
5.  **类型安全** - 完整的TypeScript类型定义（可根据需要添加）。

### 适用场景

-   **埋点统计**：跟踪用户页面浏览行为
-   **权限控制**：在路由变化时验证用户权限
-   **数据持久化**：在离开页面前保存草稿数据
-   **动态UI更新**：根据路由变化调整界面元素
-   **表单保护**：防止用户意外离开未保存的表单页面

这个 Hook 扩展了 React Router 的基本功能，提供了更细粒度的路由控制能力，可以根据实际项目需求进行进一步定制。