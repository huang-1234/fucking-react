import { lazy } from 'react';
import {
  HomeOutlined,
  AppstoreOutlined,
  LayoutOutlined,
  CloudServerOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { reactVersionMenuItems } from './ReactVersionMenu';

// 首页
const HomePage = lazy(() => import('../pages/HomePage'));

// 组件应用展示
const ComponentsApplyPage = lazy(() => import('../pages/ComponentsApply'));

// 画布面板
const CanvasPanelPage = lazy(() => import('../pages/CanvasPanel'));

// SSR页面
const SSRPage = lazy(() => import('../pages/SSR/SSRPage'));

// ECMAScript页面
const ECMAScriptPage = lazy(() => import('../pages/ECMAScript'));

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
  }
];