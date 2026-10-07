import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller.js';
import { ScraperService } from './scraper.service.js';
import { NativeFetcher } from './fetchers/native.fetcher.js';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher.js';
import { LlmModule } from '../llm/llm.module.js';
import { ScraperStrategies } from './scraper.strategies.js';

@Module({
  imports: [LlmModule],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    NativeFetcher,
    JinaReaderFetcher,
    ScraperStrategies,
  ],
  exports: [ScraperService],
})
export class ScraperModule {}
