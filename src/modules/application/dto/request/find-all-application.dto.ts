import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationStatus, Jobboard } from '@prisma/client';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { EApplicationSortField } from '../../types';

export class FindAllApplicationRequestDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Jobboard)
  jobboard?: Jobboard;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  currentStatus?: ApplicationStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isFavorite?: boolean;

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
