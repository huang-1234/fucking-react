import React from 'react';
import { Card, Typography, Tabs, Divider } from 'antd';

// Vite 环境下导入虚拟模块
// @ts-ignore - 虚拟模块没有类型定义
import viteSchemas from 'virtual:formily-props';

// Webpack 环境下尝试导入生成的 JSON 文件
let webpackSchemas = {};
try {
  // @ts-ignore - 动态导入
  webpackSchemas = require('../formily-props.json');
} catch (e) {
  console.warn('Webpack formily-props.json not found, this is normal in Vite mode');
}

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const TestPlugins: React.FC = () => {
  // 根据环境选择使用的 schemas
  const schemas = Object.keys(viteSchemas).length > 0 ? viteSchemas : webpackSchemas;

  return (
    <div style={{ padding: 24 }}>
      <Typography>
        <Title level={2}>Props to Formily Schema 插件测试</Title>
        <Paragraph>
          此页面用于测试 Vite 和 Webpack 插件是否正确提取组件 Props 并转换为 Formily Schema。
        </Paragraph>
      </Typography>

      <Divider />

      <Card title="插件状态">
        <div>
          <Text strong>当前构建工具: </Text>
          <Text type="success">{typeof import.meta.env !== 'undefined' ? 'Vite' : 'Webpack'}</Text>
        </div>
        <div>
          <Text strong>已加载组件数量: </Text>
          <Text type="success">{Object.keys(schemas).length}</Text>
        </div>
      </Card>

      <Divider />

      <Card title="生成的 Schema">
        <Tabs defaultActiveKey="1">
          <TabPane tab="组件列表" key="1">
            <ul>
              {Object.keys(schemas).map((path) => (
                <li key={path}>
                  <Text code>{path}</Text>
                </li>
              ))}
            </ul>
          </TabPane>
          <TabPane tab="Schema 内容" key="2">
            <pre style={{ maxHeight: 500, overflow: 'auto' }}>
              {JSON.stringify(schemas, null, 2)}
            </pre>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TestPlugins;
