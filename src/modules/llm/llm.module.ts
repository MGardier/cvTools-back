import { Module } from '@nestjs/common';
import { LlmService } from './llm.service.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { ProviderModule } from '../provider/provider.module.js';

@Module({
  imports: [ProviderModule],
  providers: [LlmService, GeminiProvider],
  exports: [LlmService],
})
export class LlmModule {}
