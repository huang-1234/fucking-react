import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReadStream } from 'fs';
import { fileTypeFromBlob, fileTypeFromStream } from 'file-type';
import { FileUploadValidator } from '../../../src/protection/fileUploadValidator';

// 模拟file-type模块
vi.mock('file-type');
vi.mock('fs');

describe('FileUploadValidator', () => {
  let validator: FileUploadValidator;

  beforeEach(() => {
    validator = new FileUploadValidator();
    vi.resetAllMocks();
  });

  describe('validateFile', () => {
    it('应该验证有效的文件', async () => {
      // 模拟文件类型检测结果
      vi.mocked(fileTypeFromBlob).mockResolvedValue({
        mime: 'image/jpeg',
        ext: 'jpg'
      } as any);

      const result = await validator.validateFile('/path/to/image.jpg', 'image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.detectedMime).toBe('image/jpeg');
      expect(result.detectedExtension).toBe('.jpg');
    });

    it('应该拒绝不允许的扩展名', async () => {
      // 模拟文件类型检测结果
      vi.mocked(fileTypeFromBlob).mockResolvedValue({
        mime: 'application/x-php',
        ext: 'php'
      } as any);

      const result = await validator.validateFile('/path/to/script.php', 'script.php');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('不允许的文件扩展名: .php'));
    });

    it('应该检测扩展名和内容不匹配的情况', async () => {
      // 模拟文件类型检测结果 - 文件扩展名是.jpg但实际是PHP文件
      vi.mocked(fileTypeFromBlob).mockResolvedValue({
        mime: 'application/x-php',
        ext: 'php'
      } as any);

      const result = await validator.validateFile('/path/to/script.jpg', 'script.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('文件扩展名 .jpg 与实际内容类型 .php 不匹配'));
    });

    it('应该检测双重扩展名', async () => {
      // 模拟文件类型检测结果
      vi.mocked(fileTypeFromBlob).mockResolvedValue({
        mime: 'image/jpeg',
        ext: 'jpg'
      } as any);

      const result = await validator.validateFile('/path/to/script.php.jpg', 'script.php.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('双重扩展名')
        ])
      );
    });

    it('应该处理无法确定类型的文件', async () => {
      // 模拟文件类型检测结果 - 无法确定类型
      vi.mocked(fileTypeFromBlob).mockResolvedValue(undefined);

      // 模拟流检测结果
      vi.mocked(fileTypeFromStream).mockResolvedValue(undefined);

      // 模拟createReadStream
      vi.mocked(createReadStream).mockReturnValue({
        destroy: vi.fn(),
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'close') {
            callback();
          }
          return { destroy: vi.fn() };
        })
      } as any);

      const result = await validator.validateFile('/path/to/unknown.bin', 'unknown.bin');

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('不允许的文件扩展名: .bin'),
          expect.stringContaining('无法从文件内容确定文件类型')
        ])
      );
    });

    it('应该为文本文件类型提供特殊处理', async () => {
      // 模拟文件类型检测结果 - 无法确定类型
      vi.mocked(fileTypeFromBlob).mockResolvedValue(undefined);

      // 模拟流检测结果
      vi.mocked(fileTypeFromStream).mockResolvedValue(undefined);

      // 模拟createReadStream
      vi.mocked(createReadStream).mockReturnValue({
        destroy: vi.fn(),
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'close') {
            callback();
          }
          return { destroy: vi.fn() };
        })
      } as any);

      const result = await validator.validateFile('/path/to/text.txt', 'text.txt');

      // 文本文件即使无法确定类型也应该通过验证
      expect(result.errors).not.toContain(expect.stringContaining('无法从文件内容确定文件类型'));
    });
  });

  describe('generateSafeFileName', () => {
    it('应该生成安全的文件名', () => {
      const originalName = 'my file (1).jpg';
      const safeName = validator.generateSafeFileName(originalName);
      expect(safeName).toMatch(/^my_file__1+_[a-z0-9]{8}\.jpg$/);
    });

    it('应该处理特殊字符', () => {
      const originalName = '../../../etc/passwd';
      const safeName = validator.generateSafeFileName(originalName);

      expect(safeName).not.toMatch(/\.\./);
      expect(safeName).not.toMatch(/[\\/]/);
      expect(safeName.endsWith('.passwd')).toBe(true);


  describe('getSafeUploadPath', () => {
    it('应该返回安全的上传路径', () => {
      const baseDir = '/uploads';
      const subDir = 'user_123';
      const safePath = validator.getSafeUploadPath(baseDir, subDir);

      expect(safePath).toBe('/uploads/user_123');
    });

    it('应该清理子目录中的危险路径', () => {
      const baseDir = '/uploads';
      const subDir = '../../../etc';
      const safePath = validator.getSafeUploadPath(baseDir, subDir);

      expect(safePath).not.toContain('..');
      expect(safePath).not.toContain('/etc');
    });
  });
});
