import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '要上传的文件' })
  file: Express.Multer.File;

  @ApiProperty({ description: '文件描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
