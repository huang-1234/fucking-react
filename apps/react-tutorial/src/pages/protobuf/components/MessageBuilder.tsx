import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Switch, InputNumber, Divider, Alert, Typography, Space, Collapse, Tag } from 'antd';
import * as protobuf from 'protobufjs';
import { formatHex, isMessage } from '../lib/protobuf-service';
import styles from '../index.module.less';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface MessageBuilderProps {
  root: protobuf.Root;
}

const MessageBuilder: React.FC<MessageBuilderProps> = ({ root }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>('');
  const [messageType, setMessageType] = useState<protobuf.Type | null>(null);
  const [encodedBuffer, setEncodedBuffer] = useState<Uint8Array | null>(null);
  const [encodedHex, setEncodedHex] = useState<string>('');
  const [decodedMessage, setDecodedMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageTypes, setMessageTypes] = useState<protobuf.Type[]>([]);

  // 加载所有消息类型
  useEffect(() => {
    if (!root) return;

    const types: protobuf.Type[] = [];

    // 递归查找所有消息类型
    const findMessageTypes = (namespace: protobuf.NamespaceBase) => {
      namespace.nestedArray.forEach(obj => {
        if (isMessage(obj)) {
          types.push(obj as protobuf.Type);
        }

        if (obj instanceof protobuf.Namespace) {
          findMessageTypes(obj);
        }
      });
    };

    findMessageTypes(root);
    setMessageTypes(types);
  }, [root]);

  // 处理消息类型选择
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setError(null);
    setEncodedBuffer(null);
    setEncodedHex('');
    setDecodedMessage(null);

    try {
      const type = root.lookupType(value);
      setMessageType(type);
      form.resetFields();
    } catch (err: any) {
      setError(`加载消息类型失败: ${err.message}`);
      setMessageType(null);
    }
  };

  // 编码消息
  const encodeMessage = () => {
    if (!messageType) return;

    try {
      setError(null);
      const values = form.getFieldsValue();

      // 处理表单值，转换为适当的类型
      const processedValues = processFormValues(values, messageType);

      // 验证消息
      const errMsg = messageType.verify(processedValues);
      if (errMsg) {
        throw new Error(errMsg);
      }

      // 创建消息实例
      const message = messageType.create(processedValues);

      // 编码消息
      const buffer = messageType.encode(message).finish();
      setEncodedBuffer(buffer);
      setEncodedHex(formatHex(buffer));

      // 解码消息（验证）
      const decoded = messageType.decode(buffer);
      setDecodedMessage(messageType.toObject(decoded));
    } catch (err: any) {
      setError(`编码消息失败: ${err.message}`);
      setEncodedBuffer(null);
      setEncodedHex('');
      setDecodedMessage(null);
    }
  };

  // 处理表单值，转换为适当的类型
  const processFormValues = (values: any, type: protobuf.Type) => {
    const result: any = {};

    type.fieldsArray.forEach(field => {
      const value = values[field.name];
      if (value === undefined || value === '') return;

      if (field.repeated) {
        // 处理重复字段
        if (typeof value === 'string') {
          result[field.name] = value.split(',').map(item => convertValue(item.trim(), field));
        } else if (Array.isArray(value)) {
          result[field.name] = value.map(item => convertValue(item, field));
        }
      } else if (field.map) {
        // 处理映射字段
        if (typeof value === 'string' && value.trim()) {
          try {
            result[field.name] = JSON.parse(value);
          } catch (e) {
            console.warn(`无法解析映射字段 ${field.name}: ${e}`);
          }
        }
      } else {
        // 处理普通字段
        result[field.name] = convertValue(value, field);
      }
    });

    return result;
  };

  // 转换值为适当的类型
  const convertValue = (value: any, field: protobuf.Field) => {
    if (value === undefined || value === null) return value;

    switch (field.type) {
      case 'double':
      case 'float':
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
        return Number(value);
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        // 大整数作为字符串处理
        return String(value);
      case 'bool':
        return Boolean(value);
      case 'string':
        return String(value);
      case 'bytes':
        return value; // 应该是Uint8Array或Base64字符串
      default:
        // 可能是枚举或消息类型
        if (field.resolvedType && field.resolvedType instanceof protobuf.Enum) {
          return Number(value);
        }
        return value;
    }
  };

  // 渲染字段输入组件
  const renderFieldInput = (field: protobuf.Field) => {
    // 基本类型字段
    if (field.repeated) {
      return (
        <Input.TextArea
          placeholder={`输入多个${field.type}值，用逗号分隔`}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      );
    }

    if (field.map) {
      return (
        <Input.TextArea
          placeholder={`输入JSON格式的映射，例如: {"key": "value"}`}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      );
    }

    // 处理枚举类型
    if (field.resolvedType && field.resolvedType instanceof protobuf.Enum) {
      const enumType = field.resolvedType;
      return (
        <Select placeholder={`选择${enumType.name}值`}>
          {Object.entries(enumType.values).map(([name, value]) => (
            <Option key={name} value={value}>
              {name} ({value})
            </Option>
          ))}
        </Select>
      );
    }

    // 根据字段类型渲染不同的输入组件
    switch (field.type) {
      case 'double':
      case 'float':
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        return <InputNumber style={{ width: '100%' }} />;
      case 'bool':
        return <Switch />;
      case 'string':
        return <Input />;
      case 'bytes':
        return <Input.TextArea placeholder="输入Base64编码的字节" />;
      default:
        // 嵌套消息类型
        if (field.resolvedType && field.resolvedType instanceof protobuf.Type) {
          return <Input.TextArea placeholder={`输入JSON格式的${field.resolvedType.name}对象`} />;
        }
        return <Input placeholder={field.type} />;
    }
  };

  // 渲染消息表单
  const renderMessageForm = () => {
    if (!messageType) {
      return <Alert message="请先选择一个消息类型" type="info" showIcon />;
    }

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={encodeMessage}
      >
        {messageType.fieldsArray.map(field => (
          <Form.Item
            key={field.name}
            label={
              <Space>
                {field.name}
                <Text type="secondary">({field.type})</Text>
                {field.required && <Tag color="red">必填</Tag>}
                {field.repeated && <Tag color="blue">重复</Tag>}
                {field.map && <Tag color="green">映射</Tag>}
              </Space>
            }
            name={field.name}
            rules={field.required ? [{ required: true, message: `请输入${field.name}` }] : []}
          >
            {renderFieldInput(field)}
          </Form.Item>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            编码消息
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div>
      <Card title="消息构造器" className={styles.card}>
        <Form layout="vertical">
          <Form.Item label="选择消息类型" required>
            <Select
              showSearch
              value={selectedType}
              onChange={handleTypeChange}
              placeholder="选择一个消息类型"
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {messageTypes.map(type => (
                <Option key={type.fullName} value={type.fullName}>
                  {type.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        <Divider />

        {error && (
          <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        {renderMessageForm()}
      </Card>

      {encodedBuffer && (
        <Card title="编码结果" className={styles.card}>
          <Collapse defaultActiveKey={['hex', 'decoded']}>
            <Panel header="二进制数据 (十六进制)" key="hex">
              <div className={styles.hexViewer}>
                {encodedHex}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">长度: {encodedBuffer.length} 字节</Text>
              </div>
            </Panel>

            <Panel header="解码后的消息" key="decoded">
              <pre>{JSON.stringify(decodedMessage, null, 2)}</pre>
            </Panel>
          </Collapse>
        </Card>
      )}
    </div>
  );
};

export default MessageBuilder;
