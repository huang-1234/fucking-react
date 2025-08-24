import React, { useState } from 'react';
import { Tabs, Card, message } from 'antd';
import BundleComparator from './BundleComparator';
import PluginLab from './PluginLab';
import { applyVitePlugins } from '../../services/viteService';
import { type VitePlugin } from '../../utils/viteUtils';
import './index.less';

import stylesLayout from '@/layouts/container.module.less';
const { TabPane } = Tabs;

const VitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('comparator');

  const handleApplyPlugins = async (plugins: VitePlugin[]) => {
    const result = await applyVitePlugins(plugins);
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  };

  return (
    <div className={stylesLayout.contentLayout}>
      <Card>
        <h1>Vite 学习中心</h1>
        <p>
          Vite 是一种新型前端构建工具，能够显著提升前端开发体验。它主要由两部分组成：
          一个开发服务器，它基于原生 ES 模块提供了丰富的内建功能，如速度快到惊人的模块热更新（HMR）；
          一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可以输出用于生产环境的高度优化过的静态资源。
        </p>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="构建性能对比" key="comparator">
          <BundleComparator />
        </TabPane>
        <TabPane tab="插件实验室" key="plugins">
          <PluginLab onApplyPlugins={handleApplyPlugins} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(VitePage);
