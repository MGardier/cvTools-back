import { Controller, Get, Param, Query } from '@nestjs/common';
import { OfferService } from './offer.service';
import { SearchOfferRequestDto } from './dto/request/search-offer.dto';
import { AggregatedSearchResponseDto } from './dto/response/aggregated-search.dto';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get('search/:keyword')
  @SerializeWith(AggregatedSearchResponseDto)
  async search(
    @Query() dto: SearchOfferRequestDto,
    @Param('keyword') keyword: string,
  ): Promise<AggregatedSearchResponseDto> {
    return this.offerService.search({
      keyword,
      ...dto,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });
  }
}
