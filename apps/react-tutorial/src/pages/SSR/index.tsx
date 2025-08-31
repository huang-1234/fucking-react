import React, { Suspense } from 'react';
import { Card, Tabs, Spin } from 'antd';
import SSRBasic from './SSRBasic';
import Hydration from './Hydration';
import StreamingSSR from './StreamingSSR';

const { TabPane } = Tabs;

/**
 * React 19 SSR主页面
 * 展示React 19中的SSR相关特性
 */
const SSRPage: React.FC = () => {
  return (
    < >
      <Card title="React 19 服务端渲染 (SSR)" bordered={false}>
        <p>
          React 19引入了多项SSR改进，包括流式SSR、选择性水合、服务器组件等，
          使得应用能够更快地呈现内容并提供更好的用户体验。
        </p>

        <Tabs defaultActiveKey="basic">
          <TabPane tab="基础SSR" key="basic">
            <Suspense fallback={<Spin tip="加载中..." />}>
              <SSRBasic />
            </Suspense>
          </TabPane>

          <TabPane tab="水合(Hydration)" key="hydration">
            <Suspense fallback={<Spin tip="加载中..." />}>
              <Hydration />
            </Suspense>
          </TabPane>

          <TabPane tab="流式SSR" key="streaming">
            <Suspense fallback={<Spin tip="加载中..." />}>
              <StreamingSSR />
            </Suspense>
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default SSRPage;