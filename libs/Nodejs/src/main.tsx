import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.css';

// 导入测试页面
import TestPlugins from './test-plugins';

// 导入演示组件
import App from './plugins/props-to-schema/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
      {/* 取消注释下面的行来测试插件 */}
      {/* <TestPlugins /> */}
    </ConfigProvider>
  </React.StrictMode>,
);