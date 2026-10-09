import { Controller, Get, Query } from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { SearchOfferRequestDto } from './dto/request/search-offer.dto.js';
import { AggregatedSearchResponseDto } from './dto/response/aggregated-search.dto.js';
import {
  SerializeWith,
  SkipSerialize,
} from '#shared/decorators/serialize.decorator.js';
import { Public } from '#shared/decorators/public.decorator.js';
import { IProviderHealthCheck } from './types.js';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get('search')
  @SerializeWith(AggregatedSearchResponseDto)
  async search(
    @Query() dto: SearchOfferRequestDto,
  ): Promise<AggregatedSearchResponseDto> {
    return this.offerService.search(dto);
  }

  @Public()
  @Get('health/france-travail')
  @SkipSerialize()
  async franceTravailHealth(): Promise<IProviderHealthCheck> {
    return this.offerService.checkFranceTravailHealth();
  }
}
