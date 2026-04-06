import { Controller, Get, Query } from '@nestjs/common';
import { OfferService } from './offer.service';
import { SearchOfferRequestDto } from './dto/request/search-offer.dto';
import { AggregatedSearchResponseDto } from './dto/response/aggregated-search.dto';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';

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
}
