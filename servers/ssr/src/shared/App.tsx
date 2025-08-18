/**
 * 应用根组件
 * 前后端共享的应用入口
 */
import React, { Suspense } from 'react';
import { Routes, Route, useRouteError } from 'react-router-dom';
import { routes } from './router';
import { isServer } from './utils/env';

// 加载指示器组件
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '20px',
    color: '#666'
  }}>
    加载中...
  </div>
);

// 错误边界组件
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const error = useRouteError();

  if (error) {
    // 处理错误
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff3f3',
        color: '#e53e3e',
        borderRadius: '4px',
        margin: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>出错了</h2>
        <p>组件渲染过程中发生错误。</p>
        {!isServer && (
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// 应用根组件
const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ErrorBoundary>
                <Suspense fallback={<Loading />}>
                  {route.element}
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default App;