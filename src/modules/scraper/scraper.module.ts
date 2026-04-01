import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { NativeFetcher } from './fetchers/native.fetcher';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher';
import { LlmModule } from '../llm/llm.module';
import { ScraperStrategies } from './scraper.strategies';

@Module({
  imports: [LlmModule],
  controllers: [ScraperController],
  providers: [ScraperService, NativeFetcher, JinaReaderFetcher, ScraperStrategies],
  exports: [ScraperService],
})
export class ScraperModule {}
