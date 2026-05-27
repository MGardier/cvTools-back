import { Controller, Get, Query } from '@nestjs/common';
import { OfferService } from './offer.service';
import { SearchOfferRequestDto } from './dto/request/search-offer.dto';
import { AggregatedSearchResponseDto } from './dto/response/aggregated-search.dto';
import {
  SerializeWith,
  SkipSerialize,
} from 'src/shared/decorators/serialize.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { IProviderHealthCheck } from './types';

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
