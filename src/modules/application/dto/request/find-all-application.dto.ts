import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { EApplicationSortField } from '../../types';

// ============================================================================
//                                    LEGACY
//     Old code - move above to REFACTORED when reused/adapted, else delete
// ============================================================================

export class FindAllApplicationRequestDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  currentStatus?: ApplicationStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  appliedAt?: Date;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(EApplicationSortField)
  sortField?: EApplicationSortField = EApplicationSortField.CREATED_AT;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'desc';
}
