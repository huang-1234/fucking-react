import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, Input, Alert, Tabs, Spin, Typography, Divider, Space, Tag } from 'antd';
import { SendOutlined, ApiOutlined } from '@ant-design/icons';
import * as protobuf from 'protobufjs';
import { isService, createRpcImpl, formatHex } from '../lib/protobuf-service';
import styles from '../index.module.less';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface RpcSimulatorProps {
  root: protobuf.Root;
}

interface RpcMethod {
  service: protobuf.Service;
  method: protobuf.Method;
  fullName: string;
}

const RpcSimulator: React.FC<RpcSimulatorProps> = ({ root }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<protobuf.Service[]>([]);
  const [methods, setMethods] = useState<RpcMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<RpcMethod | null>(null);
  const [requestJson, setRequestJson] = useState<string>('{}');
  const [requestBuffer, setRequestBuffer] = useState<Uint8Array | null>(null);
  const [responseJson, setResponseJson] = useState<string>('');
  const [responseBuffer, setResponseBuffer] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('/api');

  // 加载所有服务
  useEffect(() => {
    if (!root) return;

    const foundServices: protobuf.Service[] = [];

    // 递归查找所有服务
    const findServices = (namespace: protobuf.NamespaceBase) => {
      namespace.nestedArray.forEach(obj => {
        if (isService(obj)) {
          foundServices.push(obj as protobuf.Service);
        }

        if (obj instanceof protobuf.Namespace) {
          findServices(obj);
        }
      });
    };

    findServices(root);
    setServices(foundServices);

    // 构建方法列表
    const methodList: RpcMethod[] = [];
    foundServices.forEach(service => {
      Object.values(service.methods).forEach(method => {
        methodList.push({
          service,
          method,
          fullName: `${service.fullName}.${method.name}`
        });
      });
    });

    setMethods(methodList);
  }, [root]);

  // 处理方法选择
  const handleMethodChange = (value: string) => {
    const selected = methods.find(m => m.fullName === value) || null;
    setSelectedMethod(selected);
    setError(null);
    setRequestJson('{}');
    setRequestBuffer(null);
    setResponseJson('');
    setResponseBuffer(null);

    if (selected) {
      // 生成示例请求
      try {
        const requestType = selected.method.resolvedRequestType;
        if (requestType) {
          const exampleRequest = generateExampleRequest(requestType);
          setRequestJson(JSON.stringify(exampleRequest, null, 2));
        }
      } catch (err) {
        console.warn('无法生成示例请求:', err);
      }
    }
  };

  // 生成示例请求对象
  const generateExampleRequest = (type: protobuf.Type): any => {
    const result: any = {};

    type.fieldsArray.forEach(field => {
      if (field.repeated) {
        result[field.name] = [];
      } else if (field.map) {
        result[field.name] = {};
      } else if (field.resolvedType && field.resolvedType instanceof protobuf.Enum) {
        // 使用枚举的第一个值
        const values = Object.values(field.resolvedType.values);
        result[field.name] = values.length > 0 ? values[0] : 0;
      } else if (field.resolvedType && field.resolvedType instanceof protobuf.Type) {
        // 递归生成嵌套消息
        result[field.name] = generateExampleRequest(field.resolvedType);
      } else {
        // 基本类型的默认值
        switch (field.type) {
          case 'string':
            result[field.name] = `Example ${field.name}`;
            break;
          case 'bool':
            result[field.name] = false;
            break;
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
          case 'double':
          case 'float':
            result[field.name] = 0;
            break;
          default:
            result[field.name] = null;
        }
      }
    });

    return result;
  };

  // 执行RPC调用
  const callRpc = async () => {
    if (!selectedMethod) return;

    try {
      setLoading(true);
      setError(null);

      const { service, method } = selectedMethod;
      const requestType = method.resolvedRequestType;
      const responseType = method.resolvedResponseType;

      if (!requestType || !responseType) {
        throw new Error('请求或响应类型未解析');
      }

      // 解析请求JSON
      let requestObj;
      try {
        requestObj = JSON.parse(requestJson);
      } catch (err) {
        throw new Error('请求JSON格式无效');
      }

      // 验证请求对象
      const verifyError = requestType.verify(requestObj);
      if (verifyError) {
        throw new Error(`请求验证失败: ${verifyError}`);
      }

      // 创建请求消息并编码
      const requestMessage = requestType.create(requestObj);
      const requestBuf = requestType.encode(requestMessage).finish();
      setRequestBuffer(requestBuf);

      // 模拟RPC调用
      // 在实际应用中，这里应该使用真实的网络请求
      // 这里我们使用模拟响应
      const rpcImpl = createRpcImpl(baseUrl);

      // 创建服务实例
      const serviceInstance = service.create(rpcImpl);

      // 调用方法
      await new Promise<void>((resolve, reject) => {
        // @ts-ignore - 动态调用方法
        serviceInstance[method.name](requestMessage, (err: Error | null, response: any) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            // 将响应转换为JSON
            const responseObj = responseType.toObject(response, {
              longs: String,
              enums: String,
              bytes: String,
            });

            setResponseJson(JSON.stringify(responseObj, null, 2));

            // 编码响应以显示二进制格式
            const responseBuf = responseType.encode(response).finish();
            setResponseBuffer(responseBuf);

            resolve();
          } catch (encodeErr) {
            reject(encodeErr);
          }
        });
      });
    } catch (err: any) {
      setError(`RPC调用失败: ${err.message}`);
      console.error('RPC调用错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 模拟RPC调用（实际上是创建一个模拟响应）
  const simulateRpc = () => {
    if (!selectedMethod) return;

    try {
      setLoading(true);
      setError(null);

      const { method } = selectedMethod;
      const requestType = method.resolvedRequestType;
      const responseType = method.resolvedResponseType;

      if (!requestType || !responseType) {
        throw new Error('请求或响应类型未解析');
      }

      // 解析请求JSON
      let requestObj;
      try {
        requestObj = JSON.parse(requestJson);
      } catch (err) {
        throw new Error('请求JSON格式无效');
      }

      // 验证请求对象
      const verifyError = requestType.verify(requestObj);
      if (verifyError) {
        throw new Error(`请求验证失败: ${verifyError}`);
      }

      // 创建请求消息并编码
      const requestMessage = requestType.create(requestObj);
      const requestBuf = requestType.encode(requestMessage).finish();
      setRequestBuffer(requestBuf);

      // 生成模拟响应
      setTimeout(() => {
        try {
          // 创建一个模拟响应对象
          const mockResponse = generateExampleRequest(responseType);

          // 将响应转换为JSON
          setResponseJson(JSON.stringify(mockResponse, null, 2));

          // 创建响应消息并编码
          const responseMessage = responseType.create(mockResponse);
          const responseBuf = responseType.encode(responseMessage).finish();
          setResponseBuffer(responseBuf);

          setLoading(false);
        } catch (err: any) {
          setError(`生成响应失败: ${err.message}`);
          setLoading(false);
        }
      }, 1000); // 模拟网络延迟
    } catch (err: any) {
      setError(`RPC调用失败: ${err.message}`);
      console.error('RPC调用错误:', err);
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="RPC调用模拟器" className={styles.card}>
        <Form form={form} layout="vertical">
          <Form.Item label="API基础URL" name="baseUrl" initialValue={baseUrl}>
            <Input
              addonBefore="URL:"
              placeholder="输入API基础URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="选择RPC方法" required>
            <Select
              showSearch
              placeholder="选择一个RPC方法"
              optionFilterProp="children"
              onChange={handleMethodChange}
              style={{ width: '100%' }}
            >
              {methods.map(m => (
                <Option key={m.fullName} value={m.fullName}>
                  {m.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        {selectedMethod && (
          <>
            <Divider />

            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>
                  <ApiOutlined /> {selectedMethod.method.name}
                </Title>

                <div>
                  <Tag color="blue">请求类型: {selectedMethod.method.requestType}</Tag>
                  <Tag color="green">响应类型: {selectedMethod.method.responseType}</Tag>
                </div>

                {selectedMethod.method.comment && (
                  <Text type="secondary">{selectedMethod.method.comment}</Text>
                )}
              </Space>
            </div>

            <Divider />

            <Tabs defaultActiveKey="request">
              <TabPane tab="请求" key="request">
                <Form.Item label="请求JSON">
                  <TextArea
                    rows={10}
                    value={requestJson}
                    onChange={(e) => setRequestJson(e.target.value)}
                  />
                </Form.Item>
              </TabPane>

              <TabPane tab="响应" key="response">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="处理中..." />
                  </div>
                ) : responseJson ? (
                  <TextArea
                    rows={10}
                    value={responseJson}
                    readOnly
                  />
                ) : (
                  <Alert message="尚未收到响应" type="info" showIcon />
                )}
              </TabPane>

              {requestBuffer && (
                <TabPane tab="二进制请求" key="binary-request">
                  <div className={styles.hexViewer}>
                    {formatHex(requestBuffer)}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">长度: {requestBuffer.length} 字节</Text>
                  </div>
                </TabPane>
              )}

              {responseBuffer && (
                <TabPane tab="二进制响应" key="binary-response">
                  <div className={styles.hexViewer}>
                    {formatHex(responseBuffer)}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">长度: {responseBuffer.length} 字节</Text>
                  </div>
                </TabPane>
              )}
            </Tabs>

            {error && (
              <Alert
                message="错误"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            <div className={styles.buttonGroup}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={simulateRpc}
                loading={loading}
              >
                模拟调用
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default RpcSimulator;
