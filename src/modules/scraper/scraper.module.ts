import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { NativeFetcher } from './fetchers/native.fetcher';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, NativeFetcher, JinaReaderFetcher],
  exports: [ScraperService],
})
export class ScraperModule {}
