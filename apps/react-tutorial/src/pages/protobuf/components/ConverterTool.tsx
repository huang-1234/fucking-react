import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, Input, Alert, Typography, Divider } from 'antd';
import { SwapOutlined, DownloadOutlined } from '@ant-design/icons';
import * as protobuf from 'protobufjs';
import {
  jsonToProtobuf,
  protobufToJson,
  formatHex,
  base64ToBuffer,
  bufferToBase64,
  isMessage
} from '../lib/protobuf-service';
import styles from '../index.module.less';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface ConverterToolProps {
  root: protobuf.Root;
}

const ConverterTool: React.FC<ConverterToolProps> = ({ root }) => {
  const [form] = Form.useForm();
  const [messageTypes, setMessageTypes] = useState<protobuf.Type[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [messageType, setMessageType] = useState<protobuf.Type | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('{}');
  const [binaryOutput, setBinaryOutput] = useState<Uint8Array | null>(null);
  const [binaryInput, setBinaryInput] = useState<Uint8Array | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [base64Input, setBase64Input] = useState<string>('');
  const [hexOutput, setHexOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'jsonToBinary' | 'binaryToJson'>('jsonToBinary');

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
    setBinaryOutput(null);
    setJsonOutput('');
    setHexOutput('');

    try {
      const type = root.lookupType(value);
      setMessageType(type);

      // 为JSON到二进制方向生成示例JSON
      if (direction === 'jsonToBinary') {
        const exampleObj = generateExampleObject(type);
        setJsonInput(JSON.stringify(exampleObj, null, 2));
      }
    } catch (err: any) {
      setError(`加载消息类型失败: ${err.message}`);
      setMessageType(null);
    }
  };

  // 生成示例对象
  const generateExampleObject = (type: protobuf.Type): any => {
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
        result[field.name] = generateExampleObject(field.resolvedType);
      } else {
        // 基本类型的默认值
        switch (field.type) {
          case 'string':
            result[field.name] = `示例${field.name}`;
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

  // 切换转换方向
  const toggleDirection = () => {
    setDirection(prev => prev === 'jsonToBinary' ? 'binaryToJson' : 'jsonToBinary');
    setError(null);
    setBinaryOutput(null);
    setBinaryInput(null);
    setJsonOutput('');
    setJsonInput('{}');
    setBase64Input('');
    setHexOutput('');
  };

  // 从JSON转换为二进制
  const convertJsonToBinary = () => {
    if (!messageType) {
      setError('请先选择一个消息类型');
      return;
    }

    try {
      setError(null);

      // 验证JSON格式
      let jsonObj;
      try {
        jsonObj = JSON.parse(jsonInput);
      } catch (err) {
        throw new Error('JSON格式无效');
      }

      // 转换为二进制
      const binary = jsonToProtobuf(messageType, jsonObj);
      setBinaryOutput(binary);
      setHexOutput(formatHex(binary));

      // 转换为Base64
      const base64 = bufferToBase64(binary);
      setBase64Input(base64);
    } catch (err: any) {
      setError(`转换失败: ${err.message}`);
      setBinaryOutput(null);
      setHexOutput('');
      setBase64Input('');
    }
  };

  // 从二进制转换为JSON
  const convertBinaryToJson = () => {
    if (!messageType || !binaryInput) {
      setError('请先选择一个消息类型并提供二进制数据');
      return;
    }

    try {
      setError(null);

      // 检查数据是否有效
      if (binaryInput.length === 0) {
        throw new Error('二进制数据为空');
      }

      // 转换为JSON
      const result = protobufToJson(messageType, binaryInput, {
        toJson: true,
        longs: 'string',
        enums: 'string',
        bytes: 'string',
      }) as string;

      setJsonOutput(result);
    } catch (err: any) {
      console.error('转换错误详情:', err);
      // 添加更详细的错误信息
      const errorMessage = err.message.includes('invalid wire type')
        ? `无效的二进制格式: 数据可能损坏或不匹配选定的消息类型。错误详情: ${err.message}`
        : `转换失败: ${err.message}`;

      setError(errorMessage);
      setJsonOutput('');
    }
  };

  // 处理Base64输入
  const handleBase64Input = (value: string) => {
    setBase64Input(value);

    try {
      if (value) {
        // 验证Base64格式
        if (!/^[A-Za-z0-9+/=]+$/.test(value.replace(/\s/g, ''))) {
          throw new Error('无效的Base64格式');
        }

        const buffer = base64ToBuffer(value);
        setBinaryInput(buffer);
        setHexOutput(formatHex(buffer));

        // 检查是否为有效的protobuf数据
        if (messageType && buffer.length > 0) {
          try {
            // 尝试读取第一个字段，检查是否有效
            const reader = new protobuf.Reader(buffer);
            if (reader.len > 0) {
              const firstByte = reader.uint32();
              const wireType = firstByte & 0x7;
              if (wireType > 5) { // protobuf wire type 应该在0-5之间
                throw new Error(`无效的wire type: ${wireType}`);
              }
            }
          } catch (protoErr) {
            console.warn('警告: 数据可能不是有效的Protobuf格式', protoErr);
            // 这里只显示警告，不报错，因为用户可能还没选择正确的消息类型
          }
        }
      } else {
        setBinaryInput(null);
        setHexOutput('');
      }
    } catch (err: any) {
      console.error('Base64解码错误:', err);
      setError(`Base64解码失败: ${err.message}`);
      setBinaryInput(null);
      setHexOutput('');
    }
  };

  // 下载二进制文件
  const downloadBinary = () => {
    if (!binaryOutput) return;

    const blob = new Blob([binaryOutput], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType.split('.').pop() || 'proto'}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 渲染JSON到二进制转换界面
  const renderJsonToBinary = () => (
    <>
      <Form.Item label="JSON输入">
        <TextArea
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="输入JSON数据"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={convertJsonToBinary}>
          转换为二进制
        </Button>
      </Form.Item>

      {binaryOutput && (
        <>
          <Divider>转换结果</Divider>

          <Form.Item label="十六进制表示">
            <div className={styles.hexViewer}>
              {hexOutput}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">长度: {binaryOutput.length} 字节</Text>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={downloadBinary}
              >
                下载二进制文件
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="Base64编码">
            <TextArea
              rows={4}
              value={base64Input}
              readOnly
            />
          </Form.Item>
        </>
      )}
    </>
  );

  // 渲染二进制到JSON转换界面
  const renderBinaryToJson = () => (
    <>
      <Form.Item label="Base64输入">
        <TextArea
          rows={4}
          value={base64Input}
          onChange={(e) => handleBase64Input(e.target.value)}
          placeholder="输入Base64编码的二进制数据"
        />
      </Form.Item>

      {binaryInput && hexOutput && (
        <Form.Item label="十六进制预览">
          <div className={styles.hexViewer}>
            {hexOutput}
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">长度: {binaryInput.length} 字节</Text>
          </div>
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" onClick={convertBinaryToJson} disabled={!binaryInput}>
          转换为JSON
        </Button>
      </Form.Item>

      {jsonOutput && (
        <>
          <Divider>转换结果</Divider>

          <Form.Item label="JSON输出">
            <TextArea
              rows={10}
              value={jsonOutput}
              readOnly
            />
          </Form.Item>
        </>
      )}
    </>
  );

  return (
    <div>
      <Card title="Protobuf转换工具" className={styles.card}>
        <Form layout="vertical" form={form}>
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

          <Form.Item>
            <Button
              type="default"
              icon={<SwapOutlined />}
              onClick={toggleDirection}
            >
              切换转换方向: {direction === 'jsonToBinary' ? 'JSON → 二进制' : '二进制 → JSON'}
            </Button>
          </Form.Item>

          <Divider />

          {error && (
            <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}

          {direction === 'jsonToBinary' ? renderJsonToBinary() : renderBinaryToJson()}
        </Form>
      </Card>
    </div>
  );
};

export default ConverterTool;
