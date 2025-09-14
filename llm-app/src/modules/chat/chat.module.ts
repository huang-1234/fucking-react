import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { SseChatController } from './sse.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AiModule],
  controllers: [SseChatController],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
