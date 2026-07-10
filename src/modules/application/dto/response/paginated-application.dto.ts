import { Expose, Type } from 'class-transformer';

import { ApplicationResponseDto } from './application.dto';

// ============================================================================
//                                    LEGACY
//     Old code - move above to REFACTORED when reused/adapted, else delete
// ============================================================================

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
