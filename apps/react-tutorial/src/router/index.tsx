import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import React15Sandbox from '../sandbox/React15Sandbox';
import APIVersionLayout from '../components/APIVersionLayout';
import loadable from '@loadable/component';
// 富文本
const RichTextHomePage = loadable(/** webpackChunkName: "RichTextHomePage" */() => import('@/pages/RichTextHomePage'));
// Markdown渲染
const MarkdownLearningPage = loadable(/** webpackChunkName: "MarkdownLearningPage" */() => import('@/pages/RenderMD'));

// 页面组件懒加载
const HomePage = loadable(/** webpackChunkName: "HomePage" */() => import('@/pages/HomePage'));

// 画布组件
const CanvasPanelPage = loadable(/** webpackChunkName: "CanvasPanelPage" */() => import('@/pages/CanvasPanel'));

// 算法可视化组件
const AlgorithmPage = loadable(/** webpackChunkName: "AlgorithmPage" */() => import('@/pages/Algorithm'));
const LengthOfLISPage = loadable(/** webpackChunkName: "LengthOfLISPage" */() => import('@/pages/Algorithm/lengthOfLIS'));
const HeapPage = loadable(/** webpackChunkName: "HeapPage" */() => import('@/pages/Algorithm/Heap'));
const LinkTablePage = loadable(/** webpackChunkName: "LinkTablePage" */() => import('@/pages/Algorithm/LinkTable'));
const GraphPage = loadable(/** webpackChunkName: "GraphPage" */() => import('@/pages/Algorithm/Graph'));
const ProbabilityTheoryPage = loadable(/** webpackChunkName: "ProbabilityTheoryPage" */() => import('@/pages/Algorithm/ProbabilityTheory'));
const QueuePage = loadable(/** webpackChunkName: "QueuePage" */() => import('@/pages/Algorithm/Queue'));
const DPPage = loadable(/** webpackChunkName: "DPPage" */() => import('@/pages/Algorithm/DP'));
/** SkipList */
const SkipListPage = loadable(/** webpackChunkName: "SkipListPage" */() => import('@/pages/Algorithm/SkipList'));
/** Search */
const SearchAlgorithmsPage = loadable(/** webpackChunkName: "SearchAlgorithmsPage" */() => import('@/pages/Algorithm/Search'));

// React 15 组件
const React15Page = loadable(/** webpackChunkName: "React15Page" */() => import('@/pages/React15'));
const React15Fragments = loadable(/** webpackChunkName: "React15Fragments" */() => import('@/pages/React15/Fragments'));
const React15PropTypes = loadable(/** webpackChunkName: "React15PropTypes" */() => import('@/pages/React15/PropTypes'));

// React 16 组件
const React16Page = loadable(/** webpackChunkName: "React16Page" */() => import('@/pages/React16'));
const React16Hooks = loadable(/** webpackChunkName: "React16Hooks" */() => import('@/pages/React16/hooks'));
const React16ErrorBoundaries = loadable(/** webpackChunkName: "React16ErrorBoundaries" */() => import('@/pages/React16/ErrorBoundaries'));

// React 17 组件
const React17Page = loadable(/** webpackChunkName: "React17Page" */() => import('@/pages/React17'));
const React17Events = loadable(/** webpackChunkName: "React17Events" */() => import('@/pages/React17/EventDelegation'));
const React17JSX = loadable(/** webpackChunkName: "React17JSX" */() => import('@/pages/React17/NewJSX'));

// React 18 组件
const React18Page = loadable(/** webpackChunkName: "React18Page" */() => import('@/pages/React18'));
const React18Suspense = loadable(/** webpackChunkName: "React18Suspense" */() => import('@/pages/React18/SuspenseSSR'));
const React18Transitions = loadable(/** webpackChunkName: "React18Transitions" */() => import('@/pages/React18/useTransition'));

// React 19 组件
const React19Page = loadable(/** webpackChunkName: "React19Page" */() => import('@/pages/React19'));
const React19Compiler = loadable(/** webpackChunkName: "React19Compiler" */() => import('@/pages/React19/ReactCompiler'));
const React19FormState = loadable(/** webpackChunkName: "React19FormState" */() => import('@/pages/React19/useFormState'));

// SSR与性能优化组件
const SSRPage = loadable(/** webpackChunkName: "SSRPage" */() => import('@/pages/SSR/SSRPage'));
const PerformancePage = loadable(/** webpackChunkName: "PerformancePage" */() => import('@/pages/Performance'));

// 技术文档组件
const MDXDemoPage = loadable(/** webpackChunkName: "MDXDemoPage" */() => import('@/pages/Tech/MDXDemo'));

// 组件应用展示
const ComponentsApplyPage = loadable(/** webpackChunkName: "ComponentsApplyPage" */() => import('@/pages/ComponentsApply'));

// ECMAScript组件
const ECMAScriptPage = loadable(/** webpackChunkName: "ECMAScriptPage" */() => import('@/pages/ECMAScript'));

// 模块加载组件
const ModulesPage = loadable(/** webpackChunkName: "ModulesPage" */() => import('@/pages/Modules'));

// 打包工具
const WebpackPage = loadable(/** webpackChunkName: "WebpackPage" */() => import('@/pages/Webpack'));
const VitePage = loadable(/** webpackChunkName: "VitePage" */() => import('@/pages/Vite'));

// protobuf
const ProtobufPage = loadable(/** webpackChunkName: "ProtobufPage" */() => import('@/pages/protobuf'));

// lodash
const LodashPage = loadable(/** webpackChunkName: "LodashPage" */() => import('@/pages/lodash'));

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
          },
          {
            path: 'linktable',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <LinkTablePage />
              </Suspense>
            )
          },
          {
            path: 'graph',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <GraphPage />
              </Suspense>
            )
          },
          {
            path: 'probability-theory',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <ProbabilityTheoryPage />
              </Suspense>
            )
          },
          {
            path: 'queue',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <QueuePage />
              </Suspense>
            )
          },
          {
            path: 'dp',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <DPPage />
              </Suspense>
            )
          },
          // SkipList
          {
            path: 'skiplist',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <SkipListPage />
              </Suspense>
            )
          },
          {
            path: 'search',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SearchAlgorithmsPage />
                  </Suspense>
                )
              }
            ]
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
      },
      // fe utils
      {
        path: 'fe-utils',
        children: [
          // lodash路由
          {
            path: 'lodash',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <LodashPage />
              </Suspense>
            )
          },
        ]
      },
      // 模块加载路由
      {
        path: 'modules',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ModulesPage />
          </Suspense>
        )
      },
      // 性能优化路由
      {
        path: 'performance',
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <PerformancePage />
          </Suspense>
        )
      },
      // 富文本路由
      {
        path: 'rich-text',
        children: [
          {
            path: 'markdown',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <MarkdownLearningPage />
              </Suspense>
            )
          },
          {
            path: 'quill',
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <RichTextHomePage />
              </Suspense>
            )
          }
        ]
      }
    ]
  }
]);

export default routerBrowser;