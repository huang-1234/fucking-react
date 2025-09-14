import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class QueryDto {
  @ApiProperty({ description: '查询内容', example: '什么是人工智能?' })
  @IsString({ message: 'query必须是字符串' })
  @IsNotEmpty({ message: 'query不能为空' })
  @MinLength(2, { message: 'query长度不能小于2个字符' })
  query: string;
}
