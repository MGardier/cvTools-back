import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GEO_API_ENDPOINTS } from './endpoint.js';
import {
  cityApiResponseSchema,
  TRawCityApiItem,
} from './validation/city-api-response.schema.js';
import type { TCitySearchItem, TSearchCityQuery } from '@cvtools/contracts';

@Injectable()
export class CityService {
  private readonly logger = new Logger(CityService.name);

  constructor(private readonly httpService: HttpService) {}

  async search(dto: TSearchCityQuery): Promise<TCitySearchItem[]> {
    const params: Record<string, string | number> = {
      boost: 'population',
      limit: dto.limit,
    };

    if (dto.city) params.nom = dto.city;
    if (dto.postalCode) params.codePostal = dto.postalCode;

    const { data } = await firstValueFrom(
      this.httpService.get(GEO_API_ENDPOINTS.communes, { params }),
    );

    const result = cityApiResponseSchema.safeParse(data);

    if (!result.success) {
      this.logger.warn(
        'Geo API response validation failed',
        result.error.issues,
      );
      return [];
    }

    return result.data.map(this.toResponseDto);
  }

  private toResponseDto(raw: TRawCityApiItem): TCitySearchItem {
    return {
      code: raw.code,
      name: raw.nom,
      postalCodes: raw.codesPostaux,
      departmentCode: raw.codeDepartement,
      regionCode: raw.codeRegion,
      population: raw.population,
    };
  }
}
