import { Controller, Get, Query } from '@nestjs/common';
import { CityService } from './city.service.js';
import { SearchCityRequestDto } from './dto/request/search-city.dto.js';
import { CitySearchItemResponseDto } from './dto/response/city-search-item.dto.js';
import { Public } from '#src/shared/decorators/public.decorator.js';
import { SerializeWith } from '#src/shared/decorators/serialize.decorator.js';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Public()
  @Get('search')
  @SerializeWith(CitySearchItemResponseDto)
  async search(
    @Query() dto: SearchCityRequestDto,
  ): Promise<CitySearchItemResponseDto[]> {
    return this.cityService.search(dto);
  }
}
