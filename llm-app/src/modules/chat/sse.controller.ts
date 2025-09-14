import { Controller, Body, Sse, MessageEvent, Get, Post } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { Public } from '../../common/decorators/public.decorator';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatWithProviderDto } from './dto/chat-with-provider.dto';

@ApiTags('chat')
@Public() // 示例：可能跳过认证，实际应根据需要添加守卫(Guard)
@Controller('chat/sse')
export class SseChatController {
  constructor(private readonly aiService: AiService) {}

  @Sse('stream')
  @ApiOperation({
    summary: '流式聊天接口',
    description: '使用SSE（Server-Sent Events）实现流式响应，逐字返回AI回复'
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: '成功返回流式响应',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'chunk' },
                content: { type: 'string', example: '你好，我是AI助手' }
              }
            }
          }
        }
      }
    }
  })
  async streamChat(@Body() body: ChatRequestDto): Promise<Observable<MessageEvent>> {
    const { message, model } = body || {};
    const messages = [{ role: 'user' as const, content: message }];

    // 将异步生成器转换为 Observable
    // 注意：SSE 数据格式为 `data: <message>\n\n`
    return from(this.aiService.createStreamChatCompletion(messages, model)).pipe(
      map((chunk) => ({
        data: JSON.stringify({ type: 'chunk', content: chunk }),
      })),
    );
  }

  @Sse('stream/provider')
  @ApiOperation({
    summary: '多模型提供者流式聊天接口',
    description: '使用SSE实现流式响应，支持选择不同的模型提供者'
  })
  @ApiBody({ type: ChatWithProviderDto })
  @ApiResponse({
    status: 200,
    description: '成功返回流式响应',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'chunk' },
                content: { type: 'string', example: '你好，我是AI助手' }
              }
            }
          }
        }
      }
    }
  })
  async streamChatWithProvider(@Body() body: ChatWithProviderDto): Promise<Observable<MessageEvent>> {
    const { message, model, provider } = body || {};
    const messages = [{ role: 'user' as const, content: message }];

    return from(this.aiService.createStreamChatCompletion(messages, model, provider)).pipe(
      map((chunk) => ({
        data: JSON.stringify({ type: 'chunk', content: chunk }),
      })),
    );
  }

  @Post('completion')
  @ApiOperation({
    summary: '非流式聊天接口',
    description: '返回完整的AI回复，不使用流式响应'
  })
  @ApiBody({ type: ChatWithProviderDto })
  @ApiResponse({
    status: 200,
    description: '成功返回AI回复',
    schema: {
      properties: {
        content: { type: 'string', example: '你好，我是AI助手。有什么可以帮助你的吗？' }
      }
    }
  })
  async chatCompletion(@Body() body: ChatWithProviderDto) {
    const { message, model, provider } = body || {};
    const messages = [{ role: 'user' as const, content: message }];

    const content = await this.aiService.createChatCompletion(messages, model, provider);
    return { content };
  }

  @Get('info')
  @ApiOperation({ summary: '获取SSE信息', description: '返回SSE服务的基本信息' })
  @ApiResponse({
    status: 200,
    description: '成功返回SSE信息',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'info' },
            content: { type: 'string', example: 'info' }
          }
        }
      }
    }
  })
  async getInfo(): Promise<Observable<MessageEvent>> {
    return of({
      data: JSON.stringify({ type: 'info', content: 'SSE服务正常运行中' }),
    });
  }
}