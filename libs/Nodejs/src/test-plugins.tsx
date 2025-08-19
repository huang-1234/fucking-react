import React from 'react';
import { Card, Typography, Tabs, Divider } from 'antd';

// 直接导入本地生成的schema文件
import localSchemas from './plugins/props-to-schema/demos/formily-schemas.json';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const TestPlugins: React.FC = () => {
  // 使用本地schema文件
  const schemas = localSchemas;

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
          <Text type="success">使用本地文件</Text>
        </div>
        <div>
          <Text strong>已加载组件数量: </Text>
          <Text type="success">{schemas.count || Object.keys(schemas.schemas || {}).length}</Text>
        </div>
      </Card>

      <Divider />

      <Card title="生成的 Schema">
        <Tabs defaultActiveKey="1">
          <TabPane tab="组件列表" key="1">
            <ul>
              {Object.keys(schemas.schemas || {}).map((path) => (
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
