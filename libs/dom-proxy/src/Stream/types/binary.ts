/**
 * 二进制数据相关类型定义
 */

/**
 * 二进制数据输入类型
 */
export type BinaryDataInput = 
  | ArrayBuffer 
  | Blob 
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | string;

/**
 * 支持的编码格式
 */
export type TextEncoding = 
  | 'utf-8'
  | 'utf-16'
  | 'utf-16le'
  | 'utf-16be'
  | 'latin1'
  | 'ascii';

/**
 * 二进制数据配置选项
 */
export interface BinaryDataOptions {
  /** MIME类型 */
  mimeType?: string;
  /** 文本编码 */
  encoding?: TextEncoding;
  /** 是否启用严格模式 */
  strict?: boolean;
}

/**
 * 数据切片选项
 */
export interface SliceOptions {
  /** 起始位置 */
  start: number;
  /** 结束位置 */
  end?: number;
  /** 新的MIME类型 */
  mimeType?: string;
}

/**
 * 数据连接选项
 */
export interface ConcatOptions {
  /** 结果的MIME类型 */
  mimeType?: string;
  /** 是否保持原始类型 */
  preserveType?: boolean;
}

/**
 * Base64编码选项
 */
export interface Base64Options {
  /** 是否使用URL安全的Base64编码 */
  urlSafe?: boolean;
  /** 是否添加填充 */
  padding?: boolean;
}

/**
 * 文本转换选项
 */
export interface TextConversionOptions {
  /** 文本编码 */
  encoding?: TextEncoding;
  /** 是否忽略BOM */
  ignoreBOM?: boolean;
  /** 错误处理模式 */
  fatal?: boolean;
}