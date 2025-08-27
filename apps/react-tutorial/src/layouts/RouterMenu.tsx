
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
import RichTextHomePage from '@/pages/RichTextHomePage';

// 首页
const HomePage = loadable(() => import('@/pages/HomePage'));

// 组件应用展示
const ComponentsApplyPage = loadable(() => import('../pages/ComponentsApply'));

// 画布面板
const CanvasPanelPage = loadable(() => import('@/pages/CanvasPanel'));

// ECMAScript页面
const ECMAScriptPage = loadable(() => import('@/pages/ECMAScript'));

// 模块加载页面
const ModulesPage = loadable(() => import('@/pages/Modules'));

// 打包工具
const WebpackPage = loadable(() => import('@/pages/Webpack'));
const VitePage = loadable(() => import('@/pages/Vite'));

// protobuf
const ProtobufPage = loadable(() => import('@/pages/protobuf'));

// SSR与性能优化页面
const SSRPage = loadable(() => import('@/pages/SSR/SSRPage'));
const PerformancePage = loadable(() => import('@/pages/Performance'));

// 富文本
const RichTextPage = loadable(() => import('@/pages/RichTextHomePage/subpage/RichText'));

// Markdown渲染
const RenderMDPage = loadable(() => import('@/pages/RenderMD'));


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
    key: '/rich-text',
    label: '富文本',
    icon: <CodeOutlined />,
    component: RichTextHomePage,
    children: [
      {
        key: '/markdown',
        label: 'Markdown渲染',
        icon: <CodeOutlined />,
        component: RenderMDPage
      },
      {
        key: '/quill',
        label: 'Quill',
        icon: <CodeOutlined />,
        component: RichTextPage
      },
      {
        key: '/editor',
        label: 'Editor',
        icon: <CodeOutlined />,
        component: RichTextPage
      },
      {
        key: '/tinymce',
        label: 'Tinymce',
        icon: <CodeOutlined />,
        component: RichTextPage
      },
    ]
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
  },
  {
    key: '/protobuf',
    label: 'Protobuf',
    icon: <CodeOutlined />,
    component: ProtobufPage
  },
  {
    key: '/modules',
    label: '模块加载',
    icon: <CodeOutlined />,
    component: ModulesPage
  },
  {
    key: '/ssr',
    label: 'React SSR',
    icon: <CloudServerOutlined />,
    component: SSRPage
  },
  {
    key: '/performance',
    label: '性能优化',
    icon: <CodeOutlined />,
    component: PerformancePage
  },
];