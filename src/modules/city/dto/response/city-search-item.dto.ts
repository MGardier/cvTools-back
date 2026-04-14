import { Expose } from 'class-transformer';

export class CitySearchItemResponseDto {
  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  postalCodes: string[];

  @Expose()
  departmentCode?: string;

  @Expose()
  regionCode?: string;

  @Expose()
  population?: number;
}
