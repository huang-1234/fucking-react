import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AddDocumentDto {
  @ApiProperty({ description: '文档内容', example: '这是一段要添加到知识库的文本内容...' })
  @IsString({ message: 'content必须是字符串' })
  @IsNotEmpty({ message: 'content不能为空' })
  @MinLength(10, { message: 'content长度不能小于10个字符' })
  content: string;
}
