import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import ConfigGenerator from './modules/ConfigGenerator/ConfigGenerator';
import ConfigGeneratorFormily from './modules/ConfigGenerator/ConfigGeneratorFormily';
import ConfigFormily from './modules/ConfigFormily';
import DependencyGraph from './modules/DependencyGraph/DependencyGraph';
import { getWebpackStats } from '../../services/webpackService';
import './index.less';
const { TabPane } = Tabs;

const WebpackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('config');
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTabChange = (key: string) => {
    setActiveTab(key);

    // 如果切换到依赖图选项卡，加载统计数据
    if (key === 'dependency' && !statsData) {
      loadStatsData();
    }
  };

  const loadStatsData = async () => {
    setLoading(true);
    try {
      const data = await getWebpackStats();
      setStatsData(data);
    } catch (error) {
      console.error('加载统计数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <h1>Webpack 学习中心</h1>
        <p>
          Webpack 是一个现代 JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，
          它会在内部构建一个依赖图，此依赖图对应映射到项目所需的每个模块，然后生成一个或多个 bundle。
        </p>
      </Card>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="配置生成器 (普通)" key="config">
          <ConfigGenerator />
        </TabPane>
        <TabPane tab="配置生成器 (Formily JSON)" key="formily">
          <ConfigFormily />
        </TabPane>
        <TabPane tab="配置生成器 (Formily Schema)" key="formily-schema">
          <ConfigGeneratorFormily />
        </TabPane>
        <TabPane tab="依赖关系图" key="dependency">
          <DependencyGraph statsData={statsData} loading={loading} />
        </TabPane>
      </Tabs>
    </>
  );
};

export default React.memo(WebpackPage);