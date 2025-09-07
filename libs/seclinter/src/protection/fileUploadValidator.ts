/**
 * 文件上传安全校验模块
 * 提供深度文件上传安全检测，超越简单的扩展名检查
 */
import { createReadStream } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBlob, fileTypeFromStream } from 'file-type';

/**
 * 文件验证结果接口
 */
export interface FileValidationResult {
  /** 文件是否通过验证 */
  isValid: boolean;
  /** 验证错误信息 */
  errors: string[];
  /** 检测到的MIME类型 */
  detectedMime?: string;
  /** 检测到的文件扩展名 */
  detectedExtension?: string;
  /** 安全的文件名（如果生成） */
  safeFileName?: string;
}

/**
 * 文件上传验证器配置选项
 */
export interface FileUploadValidatorOptions {
  /** 允许的MIME类型列表 */
  allowedMimeTypes?: string[];
  /** 允许的文件扩展名列表 */
  allowedExtensions?: string[];
  /** 最大文件大小（字节） */
  maxFileSize?: number;
  /** 是否检查文件内容（魔数检测） */
  checkFileContent?: boolean;
  /** 是否自动生成安全文件名 */
  geneSafeFileNameShould?: boolean;
  /** 是否检查双重扩展名 */
  checkDoubleExtension?: boolean;
  /** 是否检查隐藏文件 */
  checkHiddenFiles?: boolean;
}

/**
 * 文件上传验证器类
 * 提供全面的文件上传安全验证功能
 */
export class FileUploadValidator {
  private allowedMimeTypes: Set<string>;
  private allowedExtensions: Set<string>;
  private maxFileSize: number;
  private checkFileContent: boolean;
  private geneSafeFileNameShould: boolean;
  private checkDoubleExtension: boolean;
  private checkHiddenFiles: boolean;

  /**
   * MIME类型到扩展名的映射
   */
  private mimeToExtMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'application/javascript': '.js',
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/csv': '.csv',
    'application/zip': '.zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
  };

  /**
   * 创建文件上传验证器实例
   * @param options 验证器配置选项
   */
  constructor(options?: FileUploadValidatorOptions) {
    const defaultAllowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv'
    ];

    this.allowedMimeTypes = new Set(options?.allowedMimeTypes || defaultAllowedTypes);

    // 如果没有提供扩展名列表，从MIME类型生成
    const extensions = options?.allowedExtensions ||
      Array.from(this.allowedMimeTypes).map(mime => this.mimeToExtMap[mime] || '');

    this.allowedExtensions = new Set(extensions.filter(ext => ext));
    this.maxFileSize = options?.maxFileSize || 10 * 1024 * 1024; // 默认10MB
    this.checkFileContent = options?.checkFileContent !== false; // 默认true
    this.geneSafeFileNameShould = options?.geneSafeFileNameShould !== false; // 默认true
    this.checkDoubleExtension = options?.checkDoubleExtension !== false; // 默认true
    this.checkHiddenFiles = options?.checkHiddenFiles !== false; // 默认true
  }

  /**
   * 验证文件
   * @param filePath 文件路径
   * @param originalFileName 原始文件名
   * @returns 验证结果
   */
  async validateFile(filePath: string, originalFileName: string): Promise<FileValidationResult> {
    const errors: string[] = [];
    const result: FileValidationResult = {
      isValid: false,
      errors: [],
    };

    const ext = path.extname(originalFileName).toLowerCase();
    const baseName = path.basename(originalFileName, ext);

    // 1. 检查文件是否为隐藏文件
    if (this.checkHiddenFiles && (originalFileName.startsWith('.') || baseName.startsWith('.'))) {
      errors.push('不允许上传隐藏文件');
    }

    // 2. 扩展名白名单校验
    if (!this.allowedExtensions.has(ext)) {
      errors.push(`不允许的文件扩展名: ${ext}`);
    }

    // 3. 检查双重扩展名 (e.g., .php.jpg)
    if (this.checkDoubleExtension) {
      if (originalFileName.includes('..') || originalFileName.split('.').length > 2) {
        errors.push('文件名包含潜在的恶意模式（双重扩展名）');
      }
    }

    // 4. 文件头（魔数）检测，防止伪造型攻击
    if (this.checkFileContent) {
      try {
        // 尝试直接从文件获取类型
          const fileType = await fileTypeFromBlob(filePath as any);

        if (!fileType) {
          // 如果无法确定类型，尝试从流读取
          const stream = createReadStream(filePath, { start: 0, end: 4100 });
          const streamType = await fileTypeFromStream(stream);
          stream.destroy();

          if (!streamType) {
            // 对于文本文件等可能没有明显的魔数
            if (!this.isTextFile(ext)) {
              errors.push('无法从文件内容确定文件类型');
            }
          } else if (!this.allowedMimeTypes.has(streamType.mime)) {
            errors.push(`检测到的MIME类型 ${streamType.mime} 不在允许列表中`);
            result.detectedMime = streamType.mime;
            result.detectedExtension = `.${streamType.ext}`;
          } else {
            result.detectedMime = streamType.mime;
            result.detectedExtension = `.${streamType.ext}`;
          }
        } else if (!this.allowedMimeTypes.has(fileType.mime)) {
          errors.push(`检测到的MIME类型 ${fileType.mime} 不在允许列表中`);
          result.detectedMime = fileType.mime;
          result.detectedExtension = `.${fileType.ext}`;
        } else {
          result.detectedMime = fileType.mime;
          result.detectedExtension = `.${fileType.ext}`;
        }

        // 检查文件内容与扩展名是否匹配
        if (result.detectedExtension && ext !== result.detectedExtension) {
          errors.push(`文件扩展名 ${ext} 与实际内容类型 ${result.detectedExtension} 不匹配`);
        }
      } catch (error) {
        errors.push(`文件内容检测失败: ${(error as Error).message}`);
      }
    }

    // 5. 生成安全的新文件名（防止路径遍历和执行）
    if (this.geneSafeFileNameShould) {
      result.safeFileName = this.generateSafeFileName(originalFileName);
    }

    result.errors = errors;
    result.isValid = errors.length === 0;

    return result;
  }

  /**
   * 生成安全的文件名
   * @param originalName 原始文件名
   * @returns 安全的文件名
   */
  generateSafeFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    // 移除非法字符，并用UUID替换基础名
    const safeBaseName = baseName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 20); // 限制长度

    return `${safeBaseName}_${uuidv4().substring(0, 8)}${ext}`;
  }

  /**
   * 判断是否为文本文件
   * @param ext 文件扩展名
   * @returns 是否为文本文件
   */
  private isTextFile(ext: string): boolean {
    const textExtensions = ['.txt', '.html', '.css', '.js', '.json', '.md', '.csv', '.xml', '.svg'];
    return textExtensions.includes(ext.toLowerCase());
  }

  /**
   * 获取安全的上传目录路径
   * @param baseDir 基础目录
   * @param subDir 子目录（可选）
   * @returns 安全的目录路径
   */
  getSafeUploadPath(baseDir: string, subDir?: string): string {
    // 确保baseDir是绝对路径
    const absoluteBaseDir = path.resolve(baseDir);

    // 如果没有子目录，直接返回基础目录
    if (!subDir) {
      return absoluteBaseDir;
    }

    // 清理子目录名称，防止目录遍历攻击
    const safeSubDir = subDir
      .replace(/\.\./g, '') // 移除所有的 ..
      .replace(/[\/\\]/g, '') // 移除所有的斜杠
      .replace(/[^a-z0-9_\-]/gi, '_'); // 替换其他非法字符

    return path.join(absoluteBaseDir, safeSubDir);
  }
}
