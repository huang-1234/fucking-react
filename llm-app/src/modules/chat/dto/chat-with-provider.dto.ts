import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModelProviderType } from '../../ai/interfaces/model-provider.interface';

export class ChatWithProviderDto {
  @ApiProperty({ description: '用户消息', example: '你好，请介绍一下自己' })
  @IsString({ message: 'message必须是字符串' })
  @IsNotEmpty({ message: 'message不能为空' })
  message: string;

  @ApiProperty({ description: '模型名称', example: 'gpt-3.5-turbo', required: false })
  @IsString({ message: 'model必须是字符串' })
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: '模型提供者',
    enum: ModelProviderType,
    example: 'openai',
    required: false
  })
  @IsEnum(ModelProviderType, { message: 'provider必须是有效的模型提供者类型' })
  @IsOptional()
  provider?: ModelProviderType;
}
