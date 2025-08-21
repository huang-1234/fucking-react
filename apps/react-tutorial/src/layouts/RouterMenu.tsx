import { lazy } from 'react';
import {
  HomeOutlined,
  AppstoreOutlined,
  LayoutOutlined,
  CloudServerOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { reactVersionMenuItems } from './ReactVersionMenu';
import AlgorithmPage from '@/pages/Algorithm';
import loadable from '@loadable/component';

// 首页
const HomePage = loadable(() => import('@/pages/HomePage'));

// 组件应用展示
const ComponentsApplyPage = loadable(() => import('../pages/ComponentsApply'));

// 画布面板
const CanvasPanelPage = loadable(() => import('@/pages/CanvasPanel'));

// SSR页面
const SSRPage = loadable(() => import('@/pages/SSR/SSRPage'));

// ECMAScript页面
const ECMAScriptPage = loadable(() => import('@/pages/ECMAScript'));

// 打包工具
const WebpackPage = loadable(() => import('@/pages/Webpack'));
const VitePage = loadable(() => import('@/pages/Vite'));
export interface IMenu {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: IMenu[];
  component?: React.ComponentType<any>;
}

export const menuItems: IMenu[] = [
  {
    key: '/',
    label: '首页',
    icon: <HomeOutlined />,
    component: HomePage
  },
  ...reactVersionMenuItems,
  {
    key: '/components',
    label: '组件应用展示',
    icon: <AppstoreOutlined />,
    component: ComponentsApplyPage
  },
  {
    key: '/canvas',
    label: '画布面板',
    icon: <LayoutOutlined />,
    component: CanvasPanelPage
  },
  {
    key: '/ssr',
    label: 'React SSR',
    icon: <CloudServerOutlined />,
    component: SSRPage
  },
  {
    key: '/ecmascript',
    label: 'ECMAScript',
    icon: <CodeOutlined />,
    component: ECMAScriptPage
  },
  {
    key: '/algorithm',
    label: '算法',
    icon: <CodeOutlined />,
    component: AlgorithmPage
  },
  {
    key: '/webpack',
    label: 'Webpack',
    icon: <CodeOutlined />,
    component: WebpackPage
  },
  {
    key: '/vite',
    label: 'Vite',
    icon: <CodeOutlined />,
    component: VitePage
  }
];