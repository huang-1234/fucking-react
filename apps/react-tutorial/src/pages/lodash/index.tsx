import React from 'react';
import { Tabs } from 'antd';
import LodashDemo from './components/LodashDemo';
import './styles/index.less';

const LodashPage: React.FC = () => {
  return (
    <div className="lodash-page">
      <h1 className="page-title">Lodash-ES 功能函数可视化演示</h1>
      <p className="page-description">
        这个页面展示了 Lodash-ES 中常用功能函数的使用方法和示例，帮助你快速掌握这些实用工具函数。
      </p>
      <LodashDemo />
    </div>
  );
};

export default React.memo(LodashPage);
