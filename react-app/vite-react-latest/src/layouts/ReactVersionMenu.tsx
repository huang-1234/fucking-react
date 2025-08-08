import { lazy } from 'react';
import {
  FireOutlined,
  ExperimentOutlined,
  RadarChartOutlined,
  ToolOutlined,
  CodeOutlined,
  AimOutlined
} from '@ant-design/icons';

// 按需加载各版本页面组件
const React15Page = lazy(() => import('../pages/React15'));
const React16Page = lazy(() => import('../pages/React16'));
const React17Page = lazy(() => import('../pages/React17'));
const React18Page = lazy(() => import('../pages/React18'));
const React19Page = lazy(() => import('../pages/React19'));

// 各版本下的API详情页面
const React15Fragments = lazy(() => import('../pages/React15/Fragments'));
const React15PropTypes = lazy(() => import('../pages/React15/PropTypes'));
const React16Hooks = lazy(() => import('../pages/React16/Hooks'));
const React16ErrorBoundaries = lazy(() => import('../pages/React16/ErrorBoundaries'));
const React17Events = lazy(() => import('../pages/React17/EventDelegation'));
const React17JSX = lazy(() => import('../pages/React17/NewJSX'));
const React18Suspense = lazy(() => import('../pages/React18/SuspenseSSR'));
const React18Transitions = lazy(() => import('../pages/React18/useTransition'));
const React19Compiler = lazy(() => import('../pages/React19/ReactCompiler'));
const React19FormState = lazy(() => import('../pages/React19/useFormState'));

export interface IMenu {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: IMenu[];
  component?: React.ComponentType<any>;
}

export const reactVersionMenuItems: IMenu[] = [
  {
    key: '/react15',
    label: 'React 15',
    icon: <CodeOutlined />,
    component: React15Page,
    children: [
      {
        key: '/fragments',
        label: 'Fragments',
        icon: <AimOutlined />,
        component: React15Fragments
      },
      {
        key: '/proptypes',
        label: 'PropTypes',
        icon: <ToolOutlined />,
        component: React15PropTypes
      }
    ]
  },
  {
    key: '/react16',
    label: 'React 16',
    icon: <CodeOutlined />,
    component: React16Page,
    children: [
      {
        key: '/hooks',
        label: 'Hooks API',
        icon: <RadarChartOutlined />,
        component: React16Hooks
      },
      {
        key: '/error-boundaries',
        label: 'Error Boundaries',
        icon: <AimOutlined />,
        component: React16ErrorBoundaries
      }
    ]
  },
  {
    key: '/react17',
    label: 'React 17',
    icon: <CodeOutlined />,
    component: React17Page,
    children: [
      {
        key: '/new-jsx',
        label: 'New JSX Transform',
        icon: <ExperimentOutlined />,
        component: React17JSX
      },
      {
        key: '/event-delegation',
        label: 'Event Delegation',
        icon: <RadarChartOutlined />,
        component: React17Events
      }
    ]
  },
  {
    key: '/react18',
    label: 'React 18',
    icon: <CodeOutlined />,
    component: React18Page,
    children: [
      {
        key: '/suspense-ssr',
        label: 'Suspense SSR',
        icon: <RadarChartOutlined />,
        component: React18Suspense
      },
      {
        key: '/use-transition',
        label: 'useTransition',
        icon: <AimOutlined />,
        component: React18Transitions
      }
    ]
  },
  {
    key: '/react19',
    label: 'React 19',
    icon: <CodeOutlined />,
    component: React19Page,
    children: [
      {
        key: '/react-compiler',
        label: 'React Compiler',
        icon: <ExperimentOutlined />,
        component: React19Compiler
      },
      {
        key: '/use-form-state',
        label: 'useFormState',
        icon: <FireOutlined />,
        component: React19FormState
      }
    ]
  }
];