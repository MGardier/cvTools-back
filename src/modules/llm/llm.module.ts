import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GeminiProvider } from './providers/gemini.provider';
import { ProviderModule } from '../provider/provider.module';

@Module({
  imports: [ProviderModule],
  providers: [LlmService, GeminiProvider],
  exports: [LlmService],
})
export class LlmModule {}
