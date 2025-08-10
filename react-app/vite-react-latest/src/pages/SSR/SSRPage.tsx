import React from 'react';
import SSRMainPage from './index';

/**
 * @desc 服务端渲染主页面
 * 这是一个包装组件，用于路由配置
 */
const SSRPage: React.FC = () => {
  return <SSRMainPage />;
};

export default SSRPage;