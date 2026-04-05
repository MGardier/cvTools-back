import { Expose, Type } from 'class-transformer';

import { ApplicationResponseDto } from './application.dto';

export class PaginatedApplicationResponseDto {
  @Expose()
  @Type(() => ApplicationResponseDto)
  items: ApplicationResponseDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;
}
