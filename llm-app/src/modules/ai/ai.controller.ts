import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ModelSwitchDto } from './dto/model-switch.dto';
import { ModelProviderType } from './interfaces/model-provider.interface';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('providers')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取可用的模型提供者', description: '返回当前可用的AI模型提供者列表' })
  @ApiResponse({
    status: 200,
    description: '可用的模型提供者列表',
    schema: {
      properties: {
        providers: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(ModelProviderType),
          },
          example: ['openai', 'spark'],
        },
        default: {
          type: 'string',
          example: 'openai',
        },
      },
    },
  })
  getProviders() {
    return {
      providers: Object.values(ModelProviderType),
      default: ModelProviderType.OPENAI,
    };
  }

  @Post('test')
  @ApiBearerAuth()
  @ApiOperation({ summary: '测试模型连接', description: '测试指定模型提供者的连接是否正常' })
  @ApiResponse({
    status: 200,
    description: '测试结果',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '连接成功' },
        provider: { type: 'string', example: 'openai' },
        model: { type: 'string', example: 'gpt-3.5-turbo' },
      },
    },
  })
  async testConnection(@Body() modelSwitchDto: ModelSwitchDto) {
    try {
      const { provider, model } = modelSwitchDto;
      const result = await this.aiService.createChatCompletion(
        [{ role: 'user', content: '请回复"连接测试成功"' }],
        model,
        provider,
      );

      return {
        success: true,
        message: result,
        provider,
        model: model || '默认模型',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `连接失败: ${error.message}`,
        provider: modelSwitchDto.provider,
        model: modelSwitchDto.model || '默认模型',
      };
    }
  }
}
