import React, { useState } from 'react';
import { Tabs, Card, Typography, Divider, Space } from 'antd';
import ResizeWindowDemo from './components/ResizeWindowDemo';
import './index.less';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * 组件应用展示页面
 * 展示各种组件的实际使用案例
 */
const ComponentsApply: React.FC = () => {
  const [activeKey, setActiveKey] = useState('resize-window');

  return (
    <div className="components-apply-page">
      <Card className="page-header">
        <Title level={2}>组件应用展示</Title>
        <Paragraph>
          这个页面展示了各种自定义组件的实际应用案例，你可以通过下面的标签页切换不同的组件演示。
        </Paragraph>
      </Card>

      <div className="demo-container">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          type="card"
          size="large"
          className="demo-tabs"
        >
          <TabPane tab="可调整大小组件 (ResizeWindow)" key="resize-window">
            <Card className="demo-card">
              <Title level={4}>ResizeWindow 组件</Title>
              <Paragraph>
                这是一个可以通过拖动边缘或角落来调整大小的组件。它支持多方向拖拽调整大小，类似VSCode的窗口调整功能。
              </Paragraph>
              <Divider />
              <ResizeWindowDemo />
            </Card>
          </TabPane>

          <TabPane tab="可拖拽组件 (React-Rnd)" key="react-rnd">
            <Card className="demo-card">
              <Title level={4}>React-Rnd 组件</Title>
              <Paragraph>
                这是一个基于react-rnd库实现的可调整大小和可拖动的组件。不仅可以调整大小，还可以自由拖动位置。
              </Paragraph>
              <Divider />
              <div className="coming-soon">
                <Card type="inner">
                  <Space direction="vertical" align="center" style={{ width: '100%', padding: '20px 0' }}>
                    <Title level={5}>即将添加</Title>
                    <Paragraph>React-Rnd组件演示正在开发中，敬请期待...</Paragraph>
                  </Space>
                </Card>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="更多组件" key="more">
            <Card className="demo-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={4}>更多组件示例</Title>
                  <Paragraph>
                    这里将添加更多组件的示例，敬请期待...
                  </Paragraph>
                </div>

                <Card type="inner" title="即将添加的组件">
                  <ul className="coming-soon-list">
                    <li>虚拟滚动列表</li>
                    <li>拖拽排序</li>
                    <li>图表组件</li>
                    <li>自定义表单控件</li>
                    <li>高级动画效果</li>
                  </ul>
                </Card>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ComponentsApply;
