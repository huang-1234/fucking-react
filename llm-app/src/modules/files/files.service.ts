import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly files: Map<string, { filename: string; originalName: string; description?: string; mimetype: string; size: number; path: string }> = new Map();

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists(): Promise<void> {
    try {
      if (!await existsAsync(this.uploadDir)) {
        await mkdirAsync(this.uploadDir, { recursive: true });
        this.logger.log(`创建上传目录: ${this.uploadDir}`);
      }
    } catch (error: any) {
      this.logger.error(`创建上传目录失败: ${error.message}`, error.stack);
    }
  }

  async saveFile(file: Express.Multer.File, description?: string): Promise<{ id: string; filename: string; originalName: string; size: number; mimetype: string; description?: string }> {
    try {
      const fileId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const fileExt = file.originalname.split('.').pop();
      const filename = `${fileId}.${fileExt}`;
      const filePath = join(this.uploadDir, filename);

      // 保存文件到磁盘
      await writeFileAsync(filePath, file.buffer);

      // 保存文件信息到内存
      const fileInfo = {
        filename,
        originalName: file.originalname,
        description,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath
      };

      this.files.set(fileId, fileInfo);

      this.logger.log(`文件上传成功: ${filename}, 大小: ${file.size} bytes`);

      return {
        id: fileId,
        ...fileInfo
      };
    } catch (error: any) {
      this.logger.error(`文件保存失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<Buffer> {
    const fileInfo = this.files.get(fileId);

    if (!fileInfo) {
      throw new NotFoundException(`文件不存在: ${fileId}`);
    }

    try {
      return await readFileAsync(fileInfo.path);
    } catch (error: any) {
      this.logger.error(`读取文件失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  getFileInfo(fileId: string): { filename: string; originalName: string; description?: string; mimetype: string; size: number } {
    const fileInfo = this.files.get(fileId);

    if (!fileInfo) {
      throw new NotFoundException(`文件不存在: ${fileId}`);
    }

    const { path, ...info } = fileInfo;
    return info;
  }

  async deleteFile(fileId: string): Promise<void> {
    const fileInfo = this.files.get(fileId);

    if (!fileInfo) {
      throw new NotFoundException(`文件不存在: ${fileId}`);
    }

    try {
      await unlinkAsync(fileInfo.path);
      this.files.delete(fileId);
      this.logger.log(`文件删除成功: ${fileInfo.filename}`);
    } catch (error: any) {
      this.logger.error(`文件删除失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  getAllFiles(): { id: string; filename: string; originalName: string; description?: string; mimetype: string; size: number }[] {
    return Array.from(this.files.entries()).map(([id, fileInfo]) => {
      const { path, ...info } = fileInfo;
      return {
        id,
        ...info
      };
    });
  }
}
