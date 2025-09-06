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

/**
 * 将JSON对象转换为Protobuf二进制数据
 * @param messageType Protobuf消息类型
 * @param jsonData JSON对象或字符串
 * @returns Uint8Array 二进制数据
 */
export const jsonToProtobuf = (messageType: protobuf.Type, jsonData: object | string): Uint8Array => {
  try {
    // 如果输入是JSON字符串，则解析为对象
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // 验证数据
    const errMsg = messageType.verify(data);
    if (errMsg) {
      throw new Error(`数据验证失败: ${errMsg}`);
    }

    // 创建消息实例
    const message = messageType.create(data);

    // 编码为二进制
    return messageType.encode(message).finish();
  } catch (error) {
    console.error('JSON转Protobuf失败:', error);
    throw error;
  }
};

/**
 * 将Protobuf二进制数据转换为JSON对象
 * @param messageType Protobuf消息类型
 * @param binaryData 二进制数据(Uint8Array或Buffer)
 * @param options 转换选项
 * @returns 解码后的JSON对象
 */
export const protobufToJson = (
  messageType: protobuf.Type,
  binaryData: Uint8Array | Buffer,
  options: {
    toObject?: boolean;
    toJson?: boolean;
    longs?: string | number;
    enums?: string | number;
    bytes?: string | Uint8Array;
  } = {}
): object | string => {
  try {
    // 验证二进制数据
    if (!binaryData || binaryData.length === 0) {
      throw new Error('二进制数据为空');
    }

    // 检查数据是否可能被损坏
    try {
      // 尝试使用Reader验证数据格式
      const reader = new protobuf.Reader(binaryData);
      // 读取第一个字段，检查是否有效
      if (reader.len > 0) {
        // 读取字段号和类型
        const firstByte = reader.uint32();
        const wireType = firstByte & 0x7;
        if (wireType > 5) { // protobuf wire type 应该在0-5之间
          throw new Error(`无效的wire type: ${wireType}`);
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '未知错误';
      throw new Error(`二进制数据格式无效: ${errorMessage}`);
    }

    // 解码二进制数据
    const decoded = messageType.decode(binaryData);

    // 转换为普通对象
    const objOptions: protobuf.IConversionOptions = {
      longs: options.longs === 'string' ? String : options.longs === 'number' ? Number : String,
      enums: options.enums === 'string' ? String : options.enums === 'number' ? Number : String,
      bytes: options.bytes === 'string' ? String : options.bytes instanceof Uint8Array ? Uint8Array : String,
    };

    const obj = messageType.toObject(decoded, objOptions);

    // 根据选项返回对象或JSON字符串
    if (options.toJson) {
      return JSON.stringify(obj);
    }

    return obj;
  } catch (error) {
    console.error('Protobuf转JSON失败:', error);
    throw error;
  }
};

/**
 * 将Base64字符串转换为Uint8Array
 * @param base64 Base64编码的字符串
 * @returns Uint8Array
 */
export const base64ToBuffer = (base64: string): Uint8Array => {
  try {
    // 移除可能的data URI前缀
    const base64Data = base64.replace(/^data:[^,]+,/, '');

    // 在浏览器环境中解码
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    console.error('Base64转Buffer失败:', error);
    throw error;
  }
};

/**
 * 将Uint8Array转换为Base64字符串
 * @param buffer Uint8Array数据
 * @returns Base64编码的字符串
 */
export const bufferToBase64 = (buffer: Uint8Array): string => {
  try {
    // 转换为二进制字符串
    let binaryString = '';
    const len = buffer.byteLength;

    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(buffer[i]);
    }

    // 编码为Base64
    return btoa(binaryString);
  } catch (error) {
    console.error('Buffer转Base64失败:', error);
    throw error;
  }
};