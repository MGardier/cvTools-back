import { Controller, Post, Body, Req } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ExtractUrlRequestDto } from './dto/request/extract-url.dto';
import { SkipSerialize } from 'src/shared/decorators/serialize.decorator';
import { IAuthenticatedRequest } from 'src/shared/types/request.types';
import { TExtractedApplication } from '../llm/types';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // =============================================================================
  //                               EXTRACT
  // =============================================================================

  @Post('offer/extract')
  @SkipSerialize()
  async extract(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: ExtractUrlRequestDto,
  ): Promise<TExtractedApplication> {
    return await this.scraperService.extract(dto.url, req.user.sub);
  }
}
