import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateCacheName,
  extractVersionFromCacheName,
  compareVersions,
  generateCacheWhitelist,
  generateRevision,
  addVersionToUrl,
  extractVersionFromUrl
} from '../utils/version-control';

describe('版本控制工具', () => {
  beforeEach(() => {
    // 模拟全局对象
    vi.stubGlobal('self', {
      location: {
        origin: 'https://example.com'
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCacheName', () => {
    it('应该生成带版本的缓存名称', () => {
      const result = generateCacheName('app-cache', '1.2.3');
      expect(result).toBe('app-cache-v1.2.3');
    });
  });

  describe('extractVersionFromCacheName', () => {
    it('应该从缓存名称中提取版本号', () => {
      const result = extractVersionFromCacheName('app-cache-v1.2.3');
      expect(result).toBe('1.2.3');
    });

    it('当缓存名称不包含版本号时应该返回null', () => {
      const result = extractVersionFromCacheName('app-cache');
      expect(result).toBeNull();
    });

    it('应该正确处理复杂的缓存名称', () => {
      const result = extractVersionFromCacheName('app-cache-with-dashes-v1.2.3');
      expect(result).toBe('1.2.3');
    });
  });

  describe('compareVersions', () => {
    it('当版本1大于版本2时应该返回1', () => {
      expect(compareVersions('1.2.3', '1.2.2')).toBe(1);
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareVersions('1.10.0', '1.9.0')).toBe(1);
    });

    it('当版本1等于版本2时应该返回0', () => {
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
      expect(compareVersions('0.0.0', '0.0.0')).toBe(0);
    });

    it('当版本1小于版本2时应该返回-1', () => {
      expect(compareVersions('1.2.2', '1.2.3')).toBe(-1);
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
      expect(compareVersions('1.9.0', '1.10.0')).toBe(-1);
    });

    it('应该处理不同长度的版本号', () => {
      expect(compareVersions('1.2', '1.2.0')).toBe(0);
      expect(compareVersions('1.2.0.0', '1.2')).toBe(0);
      expect(compareVersions('1.2.1', '1.2')).toBe(1);
      expect(compareVersions('1.2', '1.2.1')).toBe(-1);
    });
  });

  describe('generateCacheWhitelist', () => {
    it('应该生成包含当前缓存的白名单', () => {
      const result = generateCacheWhitelist('app-cache', '1.2.3');
      expect(result).toEqual(['app-cache-v1.2.3']);
    });

    it('应该包含额外的缓存名称', () => {
      const result = generateCacheWhitelist('app-cache', '1.2.3', ['static-cache', 'api-cache']);
      expect(result).toEqual(['app-cache-v1.2.3', 'static-cache', 'api-cache']);
    });
  });

  describe('generateRevision', () => {
    it('应该为相同内容生成相同的修订号', () => {
      const content = 'test content';
      const revision1 = generateRevision(content);
      const revision2 = generateRevision(content);

      expect(revision1).toBe(revision2);
    });

    it('应该为不同内容生成不同的修订号', () => {
      const content1 = 'test content 1';
      const content2 = 'test content 2';
      const revision1 = generateRevision(content1);
      const revision2 = generateRevision(content2);

      expect(revision1).not.toBe(revision2);
    });

    it('应该生成十六进制字符串', () => {
      const content = 'test content';
      const revision = generateRevision(content);

      expect(/^[0-9a-f]+$/.test(revision)).toBe(true);
    });
  });

  describe('addVersionToUrl', () => {
    it('应该向URL添加版本参数', () => {
      const result = addVersionToUrl('https://example.com/script.js', '1.2.3');
      expect(result).toBe('https://example.com/script.js?v=1.2.3');
    });

    it('应该处理已有参数的URL', () => {
      const result = addVersionToUrl('https://example.com/script.js?foo=bar', '1.2.3');
      expect(result).toBe('https://example.com/script.js?foo=bar&v=1.2.3');
    });

    it('应该处理相对URL', () => {
      const result = addVersionToUrl('/script.js', '1.2.3');
      expect(result).toBe('https://example.com/script.js?v=1.2.3');
    });
  });

  describe('extractVersionFromUrl', () => {
    it('应该从URL中提取版本参数', () => {
      const result = extractVersionFromUrl('https://example.com/script.js?v=1.2.3');
      expect(result).toBe('1.2.3');
    });

    it('当URL没有版本参数时应该返回null', () => {
      const result = extractVersionFromUrl('https://example.com/script.js');
      expect(result).toBeNull();
    });

    it('应该处理有多个参数的URL', () => {
      const result = extractVersionFromUrl('https://example.com/script.js?foo=bar&v=1.2.3&baz=qux');
      expect(result).toBe('1.2.3');
    });

    it('当URL无效时应该返回null', () => {
      const result = extractVersionFromUrl('invalid-url');
      expect(result).toBeNull();
    });
  });
});
