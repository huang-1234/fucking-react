import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ModelProviderType } from '../interfaces/model-provider.interface';

export class ModelSwitchDto {
  @ApiProperty({
    description: '模型提供者类型',
    enum: ModelProviderType,
    example: 'openai',
  })
  @IsEnum(ModelProviderType)
  provider: ModelProviderType;

  @ApiProperty({
    description: '模型名称',
    example: 'gpt-3.5-turbo',
    required: false,
  })
  @IsString()
  @IsOptional()
  model?: string;
}
