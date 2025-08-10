import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import React15Sandbox from '../sandbox/React15Sandbox';
import APIVersionLayout from '../components/APIVersionLayout';

// 页面组件懒加载
const HomePage = lazy(() => import('../pages/HomePage'));

// React 15 组件
const React15Page = lazy(() => import('../pages/React15'));
const React15Fragments = lazy(() => import('../pages/React15/Fragments'));
const React15PropTypes = lazy(() => import('../pages/React15/PropTypes'));

// React 16 组件
const React16Page = lazy(() => import('../pages/React16'));
const React16Hooks = lazy(() => import('../pages/React16/hooks'));
const React16ErrorBoundaries = lazy(() => import('../pages/React16/ErrorBoundaries'));

// React 17 组件
const React17Page = lazy(() => import('../pages/React17'));
const React17Events = lazy(() => import('../pages/React17/EventDelegation'));
const React17JSX = lazy(() => import('../pages/React17/NewJSX'));

// React 18 组件
const React18Page = lazy(() => import('../pages/React18'));
const React18Suspense = lazy(() => import('../pages/React18/SuspenseSSR'));
const React18Transitions = lazy(() => import('../pages/React18/useTransition'));

// React 19 组件
const React19Page = lazy(() => import('../pages/React19'));
const React19Compiler = lazy(() => import('../pages/React19/ReactCompiler'));
const React19FormState = lazy(() => import('../pages/React19/useFormState'));

// 技术文档组件
const MDXDemoPage = lazy(() => import('../pages/Tech/MDXDemo'));

// 组件应用展示
const ComponentsApplyPage = lazy(() => import('../pages/ComponentsApply'));

// 加载中组件
const LoadingComponent = () => <div>加载中...</div>;

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <HomePage />
          </Suspense>
        )
      },
      // React 15 路由
      {
        path: 'react15',
        element: <React15Sandbox />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React15Page />
              </Suspense>
            )
          },
          {
            path: 'fragments',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React15Fragments />
              </Suspense>
            )
          },
          {
            path: 'proptypes',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React15PropTypes />
              </Suspense>
            )
          }
        ]
      },
      // React 16 路由
      {
        path: 'react16',
        element: <APIVersionLayout version="16" />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React16Page />
              </Suspense>
            )
          },
          {
            path: 'hooks',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React16Hooks />
              </Suspense>
            )
          },
          {
            path: 'error-boundaries',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React16ErrorBoundaries />
              </Suspense>
            )
          }
        ]
      },
      // React 17 路由
      {
        path: 'react17',
        element: <APIVersionLayout version="17" />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React17Page />
              </Suspense>
            )
          },
          {
            path: 'new-jsx',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React17JSX />
              </Suspense>
            )
          },
          {
            path: 'event-delegation',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React17Events />
              </Suspense>
            )
          }
        ]
      },
      // React 18 路由
      {
        path: 'react18',
        element: <APIVersionLayout version="18" />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React18Page />
              </Suspense>
            )
          },
          {
            path: 'suspense-ssr',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React18Suspense />
              </Suspense>
            )
          },
          {
            path: 'use-transition',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React18Transitions />
              </Suspense>
            )
          }
        ]
      },
      // React 19 路由
      {
        path: 'react19',
        element: <APIVersionLayout version="19" />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React19Page />
              </Suspense>
            )
          },
          {
            path: 'react-compiler',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React19Compiler />
              </Suspense>
            )
          },
          {
            path: 'use-form-state',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <React19FormState />
              </Suspense>
            )
          }
        ]
      },
      // 技术文档路由
      {
        path: 'tech',
        children: [
          {
            path: 'mdx-demo',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <MDXDemoPage />
              </Suspense>
            )
          }
        ]
      },
      // 组件应用展示路由
      {
        path: 'components',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ComponentsApplyPage />
          </Suspense>
        )
      }
    ]
  }
]);

export default router;