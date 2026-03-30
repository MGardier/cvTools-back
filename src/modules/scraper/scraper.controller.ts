import { Controller, Post, Body, Req } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ExtractOfferDto } from './dto/request/extract-offer.dto';
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
    @Body() dto: ExtractOfferDto,
  ): Promise<TExtractedApplication> {
    return await this.scraperService.extract(
      req.user.sub,
      dto.url,
      dto.rawContent,
    );
  }
}
