/**
 * 二进制数据操作核心类
 * 提供统一的二进制数据处理API，支持多种数据格式转换和操作
 */

import type {
  BinaryDataInput,
  TextEncoding,
  BinaryDataOptions,
  SliceOptions,
  ConcatOptions,
  Base64Options,
  TextConversionOptions
} from '../types/binary';

import {
  DataFormatError,
  StreamError
} from '../utils/errors';

import {
  isTypedArray,
  getTypedArrayConstructor,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  stringToArrayBuffer,
  arrayBufferToString,
  concatArrayBuffers,
  sliceArrayBuffer
} from '../utils';

import { getDefaultCompatibilityManager } from './CompatibilityManager';

/**
 * 二进制数据类
 */
export class BinaryData {
  private data: ArrayBufferLike;
  private mimeType?: string;

  /**
   * 构造函数
   * @param data ArrayBuffer数据
   * @param options 选项
   */
  constructor(data: ArrayBufferLike, options: BinaryDataOptions = {}) {
    this.data = data;
    this.mimeType = options.mimeType;
  }

  /**
   * 从多种数据源创建BinaryData实例
   * @param input 输入数据
   * @param options 选项
   */
  static from(input: BinaryDataInput, options: BinaryDataOptions = {}): BinaryData {
    try {
      let arrayBuffer: ArrayBufferLike;
      let mimeType = options.mimeType;

      if (input instanceof ArrayBuffer) {
        arrayBuffer = input;
      } else if (input instanceof Blob) {
        // 注意：这里返回Promise，需要使用fromAsync
        throw new Error('Use fromAsync for Blob input');
      } else if (isTypedArray(input)) {
        arrayBuffer = input.buffer.slice(
          input.byteOffset,
          input.byteOffset + input.byteLength
        );
      } else if (typeof input === 'string') {
        arrayBuffer = stringToArrayBuffer(input, options.encoding);
        if (!mimeType) {
          mimeType = 'text/plain';
        }
      } else {
        throw new DataFormatError('ArrayBuffer|Blob|TypedArray|string', typeof input);
      }

      return new BinaryData(arrayBuffer, { ...options, mimeType });
    } catch (error) {
      throw new StreamError(
        `Failed to create BinaryData from input: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BINARY_DATA_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 从Blob异步创建BinaryData实例
   * @param blob Blob对象
   * @param options 选项
   */
  static async fromAsync(blob: Blob, options: BinaryDataOptions = {}): Promise<BinaryData> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const mimeType = options.mimeType || blob.type || 'application/octet-stream';

      return new BinaryData(arrayBuffer, { ...options, mimeType });
    } catch (error) {
      throw new StreamError(
        `Failed to create BinaryData from Blob: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BINARY_DATA_CREATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 从Base64字符串创建BinaryData实例
   * @param base64 Base64字符串
   * @param options 选项
   */
  static fromBase64(base64: string, options: BinaryDataOptions = {}): BinaryData {
    try {
      // 清理Base64字符串
      const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
      const arrayBuffer = base64ToArrayBuffer(cleanBase64);

      return new BinaryData(arrayBuffer, options);
    } catch (error) {
      throw new DataFormatError('valid Base64 string', 'invalid Base64', error as Error);
    }
  }

  /**
   * 从文本创建BinaryData实例
   * @param text 文本内容
   * @param encoding 编码格式
   * @param options 选项
   */
  static fromText(
    text: string,
    encoding: TextEncoding = 'utf-8',
    options: BinaryDataOptions = {}
  ): BinaryData {
    try {
      const arrayBuffer = stringToArrayBuffer(text, encoding);
      const mimeType = options.mimeType || 'text/plain';

      return new BinaryData(arrayBuffer, { ...options, mimeType });
    } catch (error) {
      throw new StreamError(
        `Failed to create BinaryData from text: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEXT_ENCODING_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 转换为ArrayBuffer
   */
  toArrayBuffer() {
    return this.data.slice(0);
  }

  /**
   * 转换为Blob
   * @param mimeType MIME类型
   */
  toBlob(mimeType?: string): Blob {
    const compatibilityManager = getDefaultCompatibilityManager();

    if (!compatibilityManager.isSupported('blobConstructor')) {
      throw new StreamError(
        'Blob constructor not supported in this environment',
        'BLOB_NOT_SUPPORTED'
      );
    }

    const type = mimeType || this.mimeType || 'application/octet-stream';
    return new Blob([this.data as BlobPart], { type });
  }

  /**
   * 转换为文本
   * @param options 转换选项
   */
  async toText(options: TextConversionOptions = {}): Promise<string> {
    try {
      const encoding = options.encoding || 'utf-8';
      return arrayBufferToString(this.data, encoding);
    } catch (error) {
      throw new StreamError(
        `Failed to convert to text: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEXT_DECODING_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 转换为Uint8Array
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.data);
  }

  /**
   * 转换为指定类型的TypedArray
   * @param ArrayConstructor TypedArray构造函数
   */
  toTypedArray<T extends TypedArray>(ArrayConstructor: TypedArrayConstructor<T>): T {
    return new ArrayConstructor(this.data as unknown as  Iterable<number>) as T;
  }

  /**
   * 切片操作
   * @param options 切片选项
   */
  slice(start: number, end?: number, mimeType?: string): BinaryData {
    try {
      const actualEnd = end !== undefined ? end : this.data.byteLength;

      if (start < 0 || actualEnd > this.data.byteLength || start > actualEnd) {
        throw new Error('Invalid slice parameters');
      }

      const slicedBuffer = sliceArrayBuffer(this.data, start, actualEnd);
      const resultMimeType = mimeType || this.mimeType;

      return new BinaryData(slicedBuffer, { mimeType: resultMimeType });
    } catch (error) {
      throw new StreamError(
        `Failed to slice binary data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SLICE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 连接多个BinaryData
   * @param data 要连接的数据数组
   * @param options 连接选项
   */
  concat(...data: BinaryData[]): BinaryData {
    try {
      const buffers = [this.data, ...data.map(d => d.data)];
      const concatenated = concatArrayBuffers(...buffers);

      // 使用第一个数据的MIME类型
      const mimeType = this.mimeType;

      return new BinaryData(concatenated, { mimeType });
    } catch (error) {
      throw new StreamError(
        `Failed to concatenate binary data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONCAT_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 编码为Base64
   * @param options Base64编码选项
   */
  encodeBase64(options: Base64Options = {}): string {
    try {
      let base64 = arrayBufferToBase64(this.data);

      if (options.urlSafe) {
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_');
      }

      if (options.padding === false) {
        base64 = base64.replace(/=/g, '');
      }

      return base64;
    } catch (error) {
      throw new StreamError(
        `Failed to encode to Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BASE64_ENCODING_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 解码Base64（静态方法）
   * @param base64 Base64字符串
   * @param options 解码选项
   */
  static decodeBase64(base64: string, options: Base64Options = {}): BinaryData {
    try {
      let cleanBase64 = base64;

      if (options.urlSafe) {
        cleanBase64 = cleanBase64.replace(/-/g, '+').replace(/_/g, '/');
      }

      // 添加必要的填充
      while (cleanBase64.length % 4) {
        cleanBase64 += '=';
      }

      return BinaryData.fromBase64(cleanBase64);
    } catch (error) {
      throw new StreamError(
        `Failed to decode Base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BASE64_DECODING_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 计算哈希值（简单实现）
   * @param algorithm 算法名称
   */
  async computeHash(algorithm: 'sha-1' | 'sha-256' = 'sha-256'): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new StreamError(
        'Web Crypto API not available',
        'CRYPTO_NOT_SUPPORTED'
      );
    }

    try {
      const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), this.data);
      return arrayBufferToBase64(hashBuffer);
    } catch (error) {
      throw new StreamError(
        `Failed to compute hash: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HASH_COMPUTATION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 比较两个BinaryData是否相等
   * @param other 另一个BinaryData实例
   */
  equals(other: BinaryData): boolean {
    if (this.size !== other.size) {
      return false;
    }

    const thisView = new Uint8Array(this.data);
    const otherView = new Uint8Array(other.data);

    for (let i = 0; i < thisView.length; i++) {
      if (thisView[i] !== otherView[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 克隆BinaryData实例
   */
  clone(): BinaryData {
    return new BinaryData(this.data.slice(0), { mimeType: this.mimeType });
  }

  /**
   * 获取数据大小（字节）
   */
  get size(): number {
    return this.data.byteLength;
  }

  /**
   * 获取MIME类型
   */
  get type(): string | undefined {
    return this.mimeType;
  }

  /**
   * 设置MIME类型
   */
  setType(mimeType: string): void {
    this.mimeType = mimeType;
  }

  /**
   * 检查是否为空
   */
  get isEmpty(): boolean {
    return this.data.byteLength === 0;
  }

  /**
   * 转换为JSON表示（用于调试）
   */
  toJSON(): object {
    return {
      size: this.size,
      type: this.type,
      isEmpty: this.isEmpty
    };
  }

  /**
   * 字符串表示
   */
  toString(): string {
    return `BinaryData(${this.size} bytes${this.type ? `, ${this.type}` : ''})`;
  }
}

// 类型定义
type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

type TypedArrayConstructor<T = TypedArray> =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;