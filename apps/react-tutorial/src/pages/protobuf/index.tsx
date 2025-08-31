import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Alert, Typography, Select, Space } from 'antd';
import loadable from '@loadable/component';
const ReflectionViewer = loadable(() => import('./components/ReflectionViewer'));
const MessageBuilder = loadable(() => import('./components/MessageBuilder'));
const RpcSimulator = loadable(() => import('./components/RpcSimulator'));
const FeatureExplorer = loadable(() => import('./components/FeatureExplorer'));
const ProtoErrorBoundary = loadable(() => import('./components/ProtoErrorBoundary'));
import { loadProto } from './lib/protobuf-service';
import styles from './index.module.less';
import stylesLayout from '@/layouts/container.module.less';
import classNames from 'classnames';

const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;

// 示例Proto文件列表
const EXAMPLE_PROTOS = [
  { name: 'simple.proto', path: '/examples/simple.proto', description: '简单示例' },
  { name: 'complex.proto', path: '/examples/complex.proto', description: '复杂示例（含导入）' }
];

const ProtobufPage: React.FC = () => {
  const [root, setRoot] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProto, setSelectedProto] = useState<string>(EXAMPLE_PROTOS[0].path);

  // 加载Proto文件
  useEffect(() => {
    const initProto = async () => {
      try {
        setLoading(true);
        setError(null);

        // 加载选中的Proto文件
        const protoRoot = await loadProto(selectedProto);
        setRoot(protoRoot);
      } catch (err: any) {
        console.error('加载Proto文件失败:', err);
        setError(err.message || '加载Proto文件失败');
      } finally {
        setLoading(false);
      }
    };

    initProto();
  }, [selectedProto]);

  // 处理Proto文件选择
  const handleProtoChange = (value: string) => {
    setSelectedProto(value);
  };

  // 渲染文件选择器
  const renderProtoSelector = () => (
    <Space align="center">
      <span>选择Proto文件:</span>
      <Select
        value={selectedProto}
        onChange={handleProtoChange}
        style={{ width: 200 }}
        disabled={loading}
      >
        {EXAMPLE_PROTOS.map(proto => (
          <Option key={proto.path} value={proto.path}>
            {proto.name} - {proto.description}
          </Option>
        ))}
      </Select>
    </Space>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin tip="加载Proto文件..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
          action={renderProtoSelector()}
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <Title level={2}>Protobuf.js 可视化工具</Title>
        {renderProtoSelector()}
      </div>

      <Tabs defaultActiveKey="reflection" className={styles.tabs}>
        <TabPane tab="反射系统查看器" key="reflection">
          <ProtoErrorBoundary>
            <ReflectionViewer root={root} />
          </ProtoErrorBoundary>
        </TabPane>

        <TabPane tab="消息构造器" key="message">
          <ProtoErrorBoundary>
            <MessageBuilder root={root} />
          </ProtoErrorBoundary>
        </TabPane>

        <TabPane tab="RPC调用模拟器" key="rpc">
          <ProtoErrorBoundary>
            <RpcSimulator root={root} />
          </ProtoErrorBoundary>
        </TabPane>

        <TabPane tab="版本特性对比" key="features">
          <ProtoErrorBoundary>
            <FeatureExplorer />
          </ProtoErrorBoundary>
        </TabPane>
      </Tabs>
    </>
  );
};

export default ProtobufPage;