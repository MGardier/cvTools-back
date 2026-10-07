import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ScraperService } from './scraper.service.js';
import { ExtractOfferDto } from './dto/request/extract-offer.dto.js';
import { SkipSerialize } from '#src/shared/decorators/serialize.decorator.js';
import { IAuthenticatedRequest } from '#src/shared/types/request.types.js';
import { TExtractedApplication } from '../llm/types.js';
import { CustomThrottlerGuard } from '#src/shared/guards/custom-throttler.guard.js';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // =============================================================================
  //                               EXTRACT
  // =============================================================================

  @Post('offer/extract')
  @SkipSerialize()
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
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
