import { lazy } from 'react';
import {
  HomeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { reactVersionMenuItems } from './ReactVersionMenu';

// 首页
const HomePage = lazy(() => import('../pages/HomePage'));

// 组件应用展示
const ComponentsApplyPage = lazy(() => import('../pages/ComponentsApply'));

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
  // {
  //   key: '/react-versions',
  //   label: 'React版本',
  //   icon: <CodeOutlined />,
  //   children: reactVersionMenuItems
  // },
  ...reactVersionMenuItems,
  {
    key: '/components',
    label: '组件应用展示',
    icon: <AppstoreOutlined />,
    component: ComponentsApplyPage
  }
];