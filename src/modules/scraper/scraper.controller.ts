import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ExtractUrlRequestDto } from './dto/request/extract-url.dto';
import { SkipSerialize } from 'src/shared/decorators/serialize.decorator';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // =============================================================================
  //                               EXTRACT
  // =============================================================================


  @Post('offer/extract')
  @SkipSerialize()
  @HttpCode(204)
  async extract(@Body() dto: ExtractUrlRequestDto): Promise<void> {
    await this.scraperService.extract(dto.url);
  }
}
