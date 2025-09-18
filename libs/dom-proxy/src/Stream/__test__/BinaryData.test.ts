/**
 * BinaryData类测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BinaryData } from '../core/BinaryData';
import { DataFormatError, StreamError } from '../utils/errors';
import { TestDataGenerator, setupStreamTests, AssertUtils } from './setup';

describe('BinaryData', () => {
  setupStreamTests();

  describe('构造函数', () => {
    it('应该从ArrayBuffer创建实例', () => {
      const buffer = TestDataGenerator.generateArrayBuffer(100);
      const binaryData = new BinaryData(buffer);

      expect(binaryData.size).toBe(100);
      expect(binaryData.isEmpty).toBe(false);
    });

    it('应该支持MIME类型选项', () => {
      const buffer = TestDataGenerator.generateArrayBuffer(100);
      const binaryData = new BinaryData(buffer, { mimeType: 'image/png' });

      expect(binaryData.type).toBe('image/png');
    });
  });

  describe('静态工厂方法', () => {
    it('应该从ArrayBuffer创建', () => {
      const buffer = TestDataGenerator.generateArrayBuffer(100);
      const binaryData = BinaryData.from(buffer);

      expect(binaryData.size).toBe(100);
    });

    it('应该从Uint8Array创建', () => {
      const data = TestDataGenerator.generateBinaryData(100);
      const binaryData = BinaryData.from(data);

      expect(binaryData.size).toBe(100);
      AssertUtils.assertBinaryDataEqual(binaryData.toUint8Array(), data);
    });

    it('应该从字符串创建', () => {
      const text = 'Hello, World!';
      const binaryData = BinaryData.from(text);

      expect(binaryData.size).toBeGreaterThan(0);
      expect(binaryData.type).toBe('text/plain');
    });

    it('应该从Base64创建', () => {
      const base64 = 'SGVsbG8sIFdvcmxkIQ=='; // "Hello, World!"
      const binaryData = BinaryData.fromBase64(base64);

      expect(binaryData.size).toBeGreaterThan(0);
    });

    it('应该从文本创建', () => {
      const text = 'Hello, World!';
      const binaryData = BinaryData.fromText(text, 'utf-8');

      expect(binaryData.size).toBeGreaterThan(0);
      expect(binaryData.type).toBe('text/plain');
    });

    it('应该处理无效输入', () => {
      expect(() => {
        BinaryData.from(null as any);
      }).toThrow(StreamError);
    });
  });

  describe('异步工厂方法', () => {
    it('应该从Blob创建', async () => {
      const blob = TestDataGenerator.generateBlob(100, 'text/plain');
      const binaryData = await BinaryData.fromAsync(blob);

      expect(binaryData.size).toBe(100);
      expect(binaryData.type).toBe('text/plain');
    });
  });

  describe('数据转换', () => {
    let testData: BinaryData;

    beforeEach(() => {
      const buffer = TestDataGenerator.generateArrayBuffer(100);
      testData = new BinaryData(buffer);
    });

    it('应该转换为ArrayBuffer', () => {
      const buffer = testData.toArrayBuffer();
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBe(100);
    });

    it('应该转换为Blob', () => {
      const blob = testData.toBlob('application/octet-stream');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBe(100);
      expect(blob.type).toBe('application/octet-stream');
    });

    it('应该转换为Uint8Array', () => {
      const uint8Array = testData.toUint8Array();
      expect(uint8Array).toBeInstanceOf(Uint8Array);
      expect(uint8Array.length).toBe(100);
    });

    it('应该转换为文本', async () => {
      const textData = BinaryData.fromText('Hello, World!');
      const text = await textData.toText();
      expect(text).toBe('Hello, World!');
    });

    it('应该转换为Base64', () => {
      const textData = BinaryData.fromText('Hello, World!');
      const base64 = textData.encodeBase64();
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });
  });

  describe('数据操作', () => {
    let testData: BinaryData;

    beforeEach(() => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      testData = BinaryData.from(data);
    });

    it('应该支持切片操作', () => {
      const sliced = testData.slice(2, 5);
      expect(sliced.size).toBe(3);

      const slicedArray = sliced.toUint8Array();
      expect(slicedArray[0]).toBe(3);
      expect(slicedArray[1]).toBe(4);
      expect(slicedArray[2]).toBe(5);
    });

    it('应该支持连接操作', () => {
      const data2 = BinaryData.from(new Uint8Array([11, 12, 13]));
      const concatenated = testData.concat(data2);

      expect(concatenated.size).toBe(13);

      const result = concatenated.toUint8Array();
      expect(result[9]).toBe(10);
      expect(result[10]).toBe(11);
      expect(result[11]).toBe(12);
      expect(result[12]).toBe(13);
    });

    it('应该支持克隆操作', () => {
      const cloned = testData.clone();

      expect(cloned.size).toBe(testData.size);
      expect(cloned.equals(testData)).toBe(true);
      expect(cloned).not.toBe(testData); // 不同的实例
    });

    it('应该支持相等性比较', () => {
      const data1 = BinaryData.from(new Uint8Array([1, 2, 3]));
      const data2 = BinaryData.from(new Uint8Array([1, 2, 3]));
      const data3 = BinaryData.from(new Uint8Array([1, 2, 4]));

      expect(data1.equals(data2)).toBe(true);
      expect(data1.equals(data3)).toBe(false);
    });
  });

  describe('Base64编码', () => {
    it('应该支持标准Base64编码', () => {
      const textData = BinaryData.fromText('Hello, World!');
      const base64 = textData.encodeBase64();

      // 验证可以正确解码
      const decoded = BinaryData.decodeBase64(base64);
      expect(decoded.equals(textData)).toBe(true);
    });

    it('应该支持URL安全的Base64编码', () => {
      const data = BinaryData.from(new Uint8Array([255, 254, 253]));
      const base64 = data.encodeBase64({ urlSafe: true });

      expect(base64).not.toContain('+');
      expect(base64).not.toContain('/');
    });

    it('应该支持无填充的Base64编码', () => {
      const data = BinaryData.from(new Uint8Array([1, 2]));
      const base64 = data.encodeBase64({ padding: false });

      expect(base64).not.toContain('=');
    });

    it('应该处理无效的Base64字符串', () => {
      expect(() => {
        BinaryData.fromBase64('invalid-base64!@#');
      }).toThrow(DataFormatError);
    });
  });

  describe('哈希计算', () => {
    it('应该计算SHA-256哈希', async () => {
      // 跳过如果Web Crypto API不可用
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        return;
      }

      const textData = BinaryData.fromText('Hello, World!');
      const hash = await textData.computeHash('sha-256');

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('应该计算SHA-1哈希', async () => {
      // 跳过如果Web Crypto API不可用
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        return;
      }

      const textData = BinaryData.fromText('Hello, World!');
      const hash = await textData.computeHash('sha-1');

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('属性和方法', () => {
    it('应该正确报告大小', () => {
      const data = BinaryData.from(new Uint8Array(50));
      expect(data.size).toBe(50);
    });

    it('应该正确检测空数据', () => {
      const emptyData = BinaryData.from(new Uint8Array(0));
      const nonEmptyData = BinaryData.from(new Uint8Array(1));

      expect(emptyData.isEmpty).toBe(true);
      expect(nonEmptyData.isEmpty).toBe(false);
    });

    it('应该支持MIME类型设置', () => {
      const data = BinaryData.from(new Uint8Array(10));
      expect(data.type).toBeUndefined();

      data.setType('image/png');
      expect(data.type).toBe('image/png');
    });

    it('应该提供JSON表示', () => {
      const data = BinaryData.from(new Uint8Array(10), { mimeType: 'test/type' });
      const json = data.toJSON();

      expect(json).toEqual({
        size: 10,
        type: 'test/type',
        isEmpty: false
      });
    });

    it('应该提供字符串表示', () => {
      const data = BinaryData.from(new Uint8Array(10), { mimeType: 'test/type' });
      const str = data.toString();

      expect(str).toBe('BinaryData(10 bytes, test/type)');
    });
  });

  describe('错误处理', () => {
    it('应该处理切片参数错误', () => {
      const data = BinaryData.from(new Uint8Array(10));

      expect(() => {
        data.slice(-1, 5);
      }).toThrow(StreamError);

      expect(() => {
        data.slice(5, 15);
      }).toThrow(StreamError);

      expect(() => {
        data.slice(8, 5);
      }).toThrow(StreamError);
    });

    it('应该处理文本编码错误', () => {
      // 这个测试可能需要特定的无效数据来触发编码错误
      // 在实际环境中，大多数数据都能被某种方式解码
    });
  });
});