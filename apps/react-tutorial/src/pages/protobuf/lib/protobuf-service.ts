import * as protobuf from 'protobufjs';

/**
 * 从URL加载Proto文件
 * @param url Proto文件URL
 * @returns Promise<protobuf.Root>
 */
export const loadProto = async (url: string): Promise<protobuf.Root> => {
  try {
    const root = new protobuf.Root();
    await root.load(url, { keepCase: true });
    await root.resolveAll();
    return root;
  } catch (error) {
    console.error('加载Proto文件失败:', error);
    throw error;
  }
};

/**
 * 从字符串加载Proto定义
 * @param content Proto文件内容
 * @returns protobuf.Root
 */
export const loadProtoFromString = (content: string): protobuf.Root => {
  try {
    return protobuf.parse(content).root;
  } catch (error) {
    console.error('解析Proto字符串失败:', error);
    throw error;
  }
};

/**
 * 创建RPC实现
 * @param baseUrl 基础URL
 * @returns protobuf.RPCImpl
 */
export const createRpcImpl = (baseUrl: string): protobuf.RPCImpl => {
  return async (method, requestData, callback) => {
    try {
      const response = await fetch(`${baseUrl}/${method.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: requestData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      callback(null, new Uint8Array(buffer));
    } catch (error) {
      console.error('RPC调用失败:', error);
      callback(error as Error);
    }
  };
};

/**
 * 格式化二进制数据为十六进制字符串
 * @param buffer 二进制数据
 * @returns 格式化的十六进制字符串
 */
export const formatHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
};

/**
 * 获取Proto版本特性
 * @param version Proto版本
 * @returns 特性对象
 */
export const getProtoFeatures = (version: 'proto2' | 'proto3' | '2023') => {
  const features: Record<string, string> = {
    fieldPresence: version === 'proto2' ? 'EXPLICIT' : 'IMPLICIT',
    repeatedEncoding: version === '2023' ? 'PACKED' : 'UNPACKED',
    jsonName: version === 'proto2' ? 'NO' : 'YES',
    mapFields: version === 'proto2' ? 'EMULATED' : 'NATIVE'
  };

  return features;
};

/**
 * 获取字段类型的友好名称
 * @param field 字段对象
 * @returns 友好名称
 */
export const getFieldTypeName = (field: protobuf.Field): string => {
  if (field.resolvedType) {
    return field.resolvedType.fullName;
  }

  if (field.map) {
    return `map<${(field as any).keyType}, ${field.type}>`;
  }

  if (field.repeated) {
    return `repeated ${field.type}`;
  }

  return field.type;
};

/**
 * 检查是否为服务类型
 * @param obj Protobuf反射对象
 * @returns 是否为服务
 */
export const isService = (obj: protobuf.ReflectionObject): boolean => {
  return obj instanceof protobuf.Service;
};

/**
 * 检查是否为消息类型
 * @param obj Protobuf反射对象
 * @returns 是否为消息
 */
export const isMessage = (obj: protobuf.ReflectionObject): boolean => {
  return obj instanceof protobuf.Type;
};

/**
 * 检查是否为枚举类型
 * @param obj Protobuf反射对象
 * @returns 是否为枚举
 */
export const isEnum = (obj: protobuf.ReflectionObject): boolean => {
  return obj instanceof protobuf.Enum;
};

/**
 * 获取对象图标类型
 * @param obj Protobuf反射对象
 * @returns 图标类型
 */
export const getObjectIconType = (obj: protobuf.ReflectionObject): string => {
  if (isService(obj)) return 'api';
  if (isMessage(obj)) return 'message';
  if (isEnum(obj)) return 'ordered-list';
  if (obj instanceof protobuf.Namespace) return 'folder';
  return 'file';
};
