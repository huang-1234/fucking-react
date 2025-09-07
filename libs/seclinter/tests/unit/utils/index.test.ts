import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { formatOutput, pathExists, ensureDir, saveToFile, sortBySeverity } from '../../../src/utils';

// 模拟 fs 模块
vi.mock('fs');
vi.mock('path');

describe('工具函数测试', () => {
  describe('formatOutput', () => {
    it('应正确格式化JSON输出', () => {
      const data = { key: 'value', nested: { foo: 'bar' } };
      const result = formatOutput(data, 'json');
      expect(JSON.parse(result)).toEqual(data);
    });

    it('应正确格式化文本输出', () => {
      const data = { key: 'value', nested: { foo: 'bar' } };
      const result = formatOutput(data, 'text');
      expect(result).toContain('key: value');
      expect(result).toContain('nested: foo: bar');
    });

    it('应处理数组输出', () => {
      const data = ['item1', 'item2'];
      const result = formatOutput(data, 'text');
      expect(result).toBe('item1\nitem2');
    });
  });

  describe('pathExists', () => {
    it('应返回路径存在', () => {
      vi.mocked(fs.accessSync).mockImplementation(() => undefined);
      expect(pathExists('/existing/path')).toBe(true);
    });

    it('应返回路径不存在', () => {
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      expect(pathExists('/non-existing/path')).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('应创建不存在的目录', () => {
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      ensureDir('/new/dir');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/new/dir', { recursive: true });
    });

    it('不应创建已存在的目录', () => {
      vi.mocked(fs.accessSync).mockImplementation(() => undefined);
      ensureDir('/existing/dir');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('saveToFile', () => {
    it('应保存 JSON 格式到文件', () => {
      vi.mocked(path.dirname).mockReturnValue('/output');
      vi.mocked(fs.accessSync).mockImplementation(() => undefined);

      const data = { key: 'value' };
      saveToFile(data, '/output/file.json', 'json');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/output/file.json',
        JSON.stringify(data, null, 2),
        'utf8'
      );
    });
  });

  describe('sortBySeverity', () => {
    it('应按严重程度降序排序', () => {
      const items = [
        { severity: 'low', name: 'item1' },
        { severity: 'high', name: 'item2' },
        { severity: 'medium', name: 'item3' },
        { severity: 'critical', name: 'item4' }
      ];

      const sorted = [...items].sort(sortBySeverity);

      expect(sorted[0].severity).toBe('critical');
      expect(sorted[1].severity).toBe('high');
      expect(sorted[2].severity).toBe('medium');
      expect(sorted[3].severity).toBe('low');
    });
  });
});
