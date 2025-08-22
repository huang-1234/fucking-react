import React, { useState } from 'react';
import { Tree, Card, Descriptions, Empty, Typography, Tag, Divider } from 'antd';
import { FolderOutlined, FileOutlined, ApiOutlined, MessageOutlined, OrderedListOutlined } from '@ant-design/icons';
import * as protobuf from 'protobufjs';
import { getObjectIconType, isMessage, isService, isEnum, getFieldTypeName } from '../lib/protobuf-service';
import styles from '../index.module.less';

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

interface ReflectionViewerProps {
  root: protobuf.Root;
}

const ReflectionViewer: React.FC<ReflectionViewerProps> = ({ root }) => {
  const [selectedObject, setSelectedObject] = useState<protobuf.ReflectionObject | null>(null);

  if (!root) {
    return <Empty description="未加载Proto文件" />;
  }

  // 递归构建树节点
  const buildTreeNodes = (obj: protobuf.ReflectionObject) => {
    const iconMap: Record<string, React.ReactNode> = {
      'folder': <FolderOutlined />,
      'file': <FileOutlined />,
      'api': <ApiOutlined />,
      'message': <MessageOutlined />,
      'ordered-list': <OrderedListOutlined />
    };

    const iconType = getObjectIconType(obj);
    const icon = iconMap[iconType] || <FileOutlined />;

    // 如果是命名空间且有嵌套对象
    if (obj instanceof protobuf.Namespace && obj.nestedArray.length > 0) {
      return {
        title: obj.name,
        key: obj.fullName,
        icon,
        children: obj.nestedArray.map(nested => buildTreeNodes(nested))
      };
    }

    // 叶子节点
    return {
      title: obj.name,
      key: obj.fullName,
      icon,
      isLeaf: !(obj instanceof protobuf.Namespace) || obj.nestedArray.length === 0
    };
  };

  const treeData = [buildTreeNodes(root)];

  // 处理节点选择
  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length === 0) return;

    const fullName = selectedKeys[0].toString();
    const obj = root.lookup(fullName);
    setSelectedObject(obj);
  };

  // 渲染对象详情
  const renderObjectDetails = () => {
    if (!selectedObject) {
      return <Empty description="请选择一个对象查看详情" />;
    }

    if (isMessage(selectedObject)) {
      const message = selectedObject as protobuf.Type;
      return (
        <>
          <Title level={4}>消息: {message.name}</Title>
          <Text type="secondary">完整路径: {message.fullName}</Text>

          <Divider orientation="left">字段</Divider>
          <Descriptions bordered column={1}>
            {message.fieldsArray.map(field => (
              <Descriptions.Item
                key={field.name}
                label={
                  <div>
                    {field.name}
                    {field.required && <Tag color="red" style={{ marginLeft: 8 }}>必填</Tag>}
                    {field.repeated && <Tag color="blue" style={{ marginLeft: 8 }}>重复</Tag>}
                    {field.map && <Tag color="green" style={{ marginLeft: 8 }}>映射</Tag>}
                  </div>
                }
              >
                <div>
                  <div>类型: {getFieldTypeName(field)}</div>
                  <div>ID: {field.id}</div>
                  {field.comment && <div>注释: {field.comment}</div>}
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      );
    }

    if (isService(selectedObject)) {
      const service = selectedObject as protobuf.Service;
      return (
        <>
          <Title level={4}>服务: {service.name}</Title>
          <Text type="secondary">完整路径: {service.fullName}</Text>

          <Divider orientation="left">方法</Divider>
          <Descriptions bordered column={1}>
            {Object.values(service.methods).map(method => (
              <Descriptions.Item
                key={method.name}
                label={method.name}
              >
                <div>
                  <div>请求类型: {method.requestType}</div>
                  <div>响应类型: {method.responseType}</div>
                  {method.comment && <div>注释: {method.comment}</div>}
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      );
    }

    if (isEnum(selectedObject)) {
      const enumObj = selectedObject as protobuf.Enum;
      return (
        <>
          <Title level={4}>枚举: {enumObj.name}</Title>
          <Text type="secondary">完整路径: {enumObj.fullName}</Text>

          <Divider orientation="left">值</Divider>
          <Descriptions bordered column={1}>
            {Object.entries(enumObj.values).map(([name, value]) => (
              <Descriptions.Item key={name} label={name}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      );
    }

    // 默认显示基本信息
    return (
      <>
        <Title level={4}>{selectedObject.constructor.name}: {selectedObject.name}</Title>
        <Text type="secondary">完整路径: {selectedObject.fullName}</Text>
        {selectedObject.comment && (
          <>
            <Divider orientation="left">注释</Divider>
            <Text>{selectedObject.comment}</Text>
          </>
        )}
      </>
    );
  };

  return (
    <div className={styles.protoViewer}>
      <div className={styles.treePanel}>
        <Card title="Proto结构" className={styles.card}>
          <DirectoryTree
            defaultExpandAll
            onSelect={handleSelect}
            treeData={treeData}
          />
        </Card>
      </div>

      <div className={styles.contentPanel}>
        <Card title="对象详情" className={styles.card}>
          {renderObjectDetails()}
        </Card>
      </div>
    </div>
  );
};

export default ReflectionViewer;
