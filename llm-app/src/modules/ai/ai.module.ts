import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ModelProviderFactory } from './factories/model-provider.factory';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, ModelProviderFactory],
  exports: [AiService],
})
export class AiModule {}
