import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpStatus,
  ParseFilePipeBuilder,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传文件', description: '上传单个文件，支持可选的文件描述' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传表单',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 201,
    description: '文件上传成功',
    schema: {
      properties: {
        id: { type: 'string', example: 'lp1mqcf8g' },
        filename: { type: 'string', example: 'lp1mqcf8g.pdf' },
        originalName: { type: 'string', example: 'document.pdf' },
        size: { type: 'number', example: 12345 },
        mimetype: { type: 'string', example: 'application/pdf' },
        description: { type: 'string', example: '这是一份PDF文档' },
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }) // 10MB
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() body: { description?: string },
  ) {
    return this.filesService.saveFile(file, body.description);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有文件', description: '获取所有上传的文件信息列表' })
  @ApiResponse({
    status: 200,
    description: '文件列表',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', example: 'lp1mqcf8g' },
          filename: { type: 'string', example: 'lp1mqcf8g.pdf' },
          originalName: { type: 'string', example: 'document.pdf' },
          size: { type: 'number', example: 12345 },
          mimetype: { type: 'string', example: 'application/pdf' },
          description: { type: 'string', example: '这是一份PDF文档' },
        }
      }
    }
  })
  getAllFiles() {
    return this.filesService.getAllFiles();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载文件', description: '通过文件ID下载文件' })
  @ApiResponse({ status: 200, description: '文件内容' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const fileInfo = this.filesService.getFileInfo(id);
    const file = await this.filesService.getFile(id);

    res.setHeader('Content-Type', fileInfo.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileInfo.originalName)}`);
    res.send(file);
  }

  @Get('info/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取文件信息', description: '通过文件ID获取文件信息' })
  @ApiResponse({
    status: 200,
    description: '文件信息',
    schema: {
      properties: {
        filename: { type: 'string', example: 'lp1mqcf8g.pdf' },
        originalName: { type: 'string', example: 'document.pdf' },
        size: { type: 'number', example: 12345 },
        mimetype: { type: 'string', example: 'application/pdf' },
        description: { type: 'string', example: '这是一份PDF文档' },
      }
    }
  })
  @ApiResponse({ status: 404, description: '文件不存在' })
  getFileInfo(@Param('id') id: string) {
    return this.filesService.getFileInfo(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文件', description: '通过文件ID删除文件' })
  @ApiResponse({ status: 200, description: '文件删除成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async deleteFile(@Param('id') id: string) {
    await this.filesService.deleteFile(id);
    return { message: '文件删除成功' };
  }
}
