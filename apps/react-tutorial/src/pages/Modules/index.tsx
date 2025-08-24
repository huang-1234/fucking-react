import React from 'react';
import { Tabs, Typography, Layout } from 'antd';
import stylesLayout from '@/layouts/container.module.less';
import DemoModuleLoader from './examples/UniversalModuleLoad';
import DemoJSFetch from './examples/DemoJSFetch';
const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;
const { Content } = Layout;

enum ModuleType {
  UniversalModuleLoad = 'universalModuleLoad',
  JSFetch = 'jsFetch',
}

const ModulesPage: React.FC = () => {
  const items = [
    {
      key: ModuleType.UniversalModuleLoad,
      label: '通用模块加载',
      children: <DemoModuleLoader />
    },
    {
      key: ModuleType.JSFetch,
      label: '获取模块代码',
      children: <DemoJSFetch />
    },
  ];

  return (
    <Layout className={stylesLayout.contentLayout}>
      <Content>
        <Typography>
          <Title level={2}>模块加载</Title>
          <Paragraph>
            本页面展示了模块加载的实现，包括AMD、CJS、ESM、UMD、IIFE。
          </Paragraph>
        </Typography>

        <Tabs
          defaultActiveKey={ModuleType.UniversalModuleLoad}
          tabPosition="left"
          style={{ marginTop: 20 }}
        >
          {items.map((item) => (
            <TabPane key={item.key} tab={item.label}>
              {item.children}
            </TabPane>
          ))}
        </ Tabs>
      </Content>
    </Layout>
  );
};

export default React.memo(ModulesPage);
