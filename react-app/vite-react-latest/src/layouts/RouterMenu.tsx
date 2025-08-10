import { lazy } from 'react';
import {
  HomeOutlined,
  AppstoreOutlined,
  LayoutOutlined
} from '@ant-design/icons';
import { reactVersionMenuItems } from './ReactVersionMenu';

// 首页
const HomePage = lazy(() => import('../pages/HomePage'));

// 组件应用展示
const ComponentsApplyPage = lazy(() => import('../pages/ComponentsApply'));

// 画布面板
const CanvasPanelPage = lazy(() => import('../pages/CanvasPanel'));

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
  }
];