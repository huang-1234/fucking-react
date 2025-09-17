import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ description: '用户消息', example: '你好，请介绍一下自己' })
  @IsString({ message: 'message必须是字符串' })
  @IsNotEmpty({ message: 'message不能为空' })
  message: string;

  @ApiProperty({ description: '模型名称', example: 'gpt-3.5-turbo', required: false })
  @IsString({ message: 'model必须是字符串' })
  @IsOptional()
  model?: string;
}
