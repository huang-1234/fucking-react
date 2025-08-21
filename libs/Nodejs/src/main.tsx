import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.css';

// 导入测试页面
import TestPlugins from './test-plugins';

// 导入演示组件
import App from './plugins/props-to-schema/demos/DemoApp';

// 导入Formily Schema渲染器
import FormilySchemaRenderer from './plugins/props-to-schema/demos/FormilySchemaRenderer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
      <FormilySchemaRenderer />
      {/* <TestPlugins /> */}
    </ConfigProvider>
  </React.StrictMode>,
);