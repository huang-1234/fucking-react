import { Controller, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AiService } from '../ai/ai.service';
import { Public } from '../../common/decorators/public.decorator';

interface ChatRequest {
  message: string;
  model?: string;
}

@Public() // 示例：可能跳过认证，实际应根据需要添加守卫(Guard)
@Controller('chat/sse')
export class SseChatController {
  constructor(private readonly aiService: AiService) {}

  @Sse('stream') // NestJS 内置的 @Sse 装饰器
  async streamChat(@Body() body: ChatRequest): Promise<Observable<MessageEvent>> {
    const { message, model } = body;
    const messages = [{ role: 'user' as const, content: message }];

    // 将异步生成器转换为 Observable
    // 注意：SSE 数据格式为 `data: <message>\n\n`
    return from(this.aiService.createStreamChatCompletion(messages, model)).pipe(
      map((chunk) => ({
        data: JSON.stringify({ type: 'chunk', content: chunk }), // 发送数据块
      })),
    );
  }
}