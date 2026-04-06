import { Controller, Get, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { SearchCityRequestDto } from './dto/request/search-city.dto';
import { CitySearchItemResponseDto } from './dto/response/city-search-item.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { SerializeWith } from 'src/shared/decorators/serialize.decorator';

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
