import {  Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import React15Sandbox from '../sandbox/React15Sandbox';
import APIVersionLayout from '../components/APIVersionLayout';
import loadable from '@loadable/component';

// 页面组件懒加载
const HomePage = loadable(() => import('@/pages/HomePage'));

// 画布组件
const CanvasPanelPage = loadable(() => import('@/pages/CanvasPanel'));

// 算法可视化组件
const AlgorithmPage = loadable(() => import('@/pages/Algorithm'));
const LengthOfLISPage = loadable(() => import('@/pages/Algorithm/lengthOfLIS'));
const HeapPage = loadable(() => import('@/pages/Algorithm/Heap'));

// React 15 组件
const React15Page = loadable(() => import('@/pages/React15'));
const React15Fragments = loadable(() => import('@/pages/React15/Fragments'));
const React15PropTypes = loadable(() => import('@/pages/React15/PropTypes'));

// React 16 组件
const React16Page = loadable(() => import('@/pages/React16'));
const React16Hooks = loadable(() => import('@/pages/React16/hooks'));
const React16ErrorBoundaries = loadable(() => import('@/pages/React16/ErrorBoundaries'));

// React 17 组件
const React17Page = loadable(() => import('@/pages/React17'));
const React17Events = loadable(() => import('@/pages/React17/EventDelegation'));
const React17JSX = loadable(() => import('@/pages/React17/NewJSX'));

// React 18 组件
const React18Page = loadable(() => import('@/pages/React18'));
const React18Suspense = loadable(() => import('@/pages/React18/SuspenseSSR'));
const React18Transitions = loadable(() => import('@/pages/React18/useTransition'));

// React 19 组件
const React19Page = loadable(() => import('@/pages/React19'));
const React19Compiler = loadable(() => import('@/pages/React19/ReactCompiler'));
const React19FormState = loadable(() => import('@/pages/React19/useFormState'));

// SSR组件
const SSRPage = loadable(() => import('@/pages/SSR/SSRPage'));

// 技术文档组件
const MDXDemoPage = loadable(() => import('@/pages/Tech/MDXDemo'));

// 组件应用展示
const ComponentsApplyPage = loadable(() => import('@/pages/ComponentsApply'));

// ECMAScript组件
const ECMAScriptPage = loadable(() => import('@/pages/ECMAScript'));



// 打包工具
const WebpackPage = loadable(() => import('@/pages/Webpack'));
const VitePage = loadable(() => import('@/pages/Vite'));

// protobuf
const ProtobufPage = loadable(() => import('@/pages/protobuf'));

// 加载中组件
const LoadingComponent = () => <div>加载中...</div>;

// 路由配置
const routerBrowser = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // 首页路由
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <HomePage />
          </Suspense>
        )
      },
      // canvas路由
      {
        path: 'canvas',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CanvasPanelPage />
          </Suspense>
        )
      },
      // ECMAScript路由
      {
        path: 'ecmascript',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ECMAScriptPage />
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
      },
      // 算法可视化路由
      {
        path: 'algorithm',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <AlgorithmPage />
              </Suspense>
            )
          },
          {
            path: 'lengthoflis',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <LengthOfLISPage />
              </Suspense>
            )
          },
          {
            path: 'heap',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <HeapPage />
              </Suspense>
            )
          }
        ]
      },
      // SSR路由
      {
        path: 'ssr',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <SSRPage />
          </Suspense>
        )
      },
      // Webpack路由
      {
        path: 'webpack',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <WebpackPage />
          </Suspense>
        )
      },

      // Vite路由
      {
        path: 'vite',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <VitePage />
          </Suspense>
        )
      },
      // protobuf路由
      {
        path: 'protobuf',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ProtobufPage />
          </Suspense>
        )
      }
    ]
  }
]);

export default routerBrowser;