import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EContractType,
  EExperienceLevel,
  EOfferJobboardOrigin,
  EPublishedSince,
  ERemotePolicy,
} from '../../types';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

export class SearchOfferRequestDto {

  @IsString()
  @IsNotEmpty({ message: DtoErrorCodeEnum.KEYWORD_REQUIRED })
  @Transform(({ value }) => value?.trim())
  @MaxLength(200, { message: DtoErrorCodeEnum.KEYWORD_TOO_LONG })
  keyword!: string;

  // INSEE commune code (5 chars). Metropolitan: 5 digits. Corsica: 2A/2B + 3 digits.
  @IsOptional()
  @IsString()
  @Matches(/^(\d{5}|2[AB]\d{3})$/i, { message: DtoErrorCodeEnum.CITY_CODE_INVALID })
  cityCode?: string;

  // INSEE department code: 2 digits (01-95), 2A/2B for Corsica, or 3 digits (971-978) for overseas.
  @IsOptional()
  @IsString()
  @Matches(/^(\d{2,3}|2[AB])$/i, { message: DtoErrorCodeEnum.DEPARTMENT_CODE_INVALID })
  departmentCode?: string;

  // INSEE region code: 2 digits.
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}$/, { message: DtoErrorCodeEnum.REGION_CODE_INVALID })
  regionCode?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsEnum(EContractType)
  contractType?: EContractType;

  @IsOptional()
  @IsEnum(ERemotePolicy)
  remote?: ERemotePolicy;

  @IsOptional()
  @IsEnum(EExperienceLevel)
  experience?: EExperienceLevel;

  @IsOptional()
  @IsEnum(EPublishedSince)
  publishedSince?: EPublishedSince;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(EOfferJobboardOrigin, { each: true })
  jobboard?: EOfferJobboardOrigin[];

  @IsOptional()
  @Transform(({ value }) => (isNaN(+value) ? 1 : +value) )
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) =>(isNaN(+value) ? 20 : +value))
  @IsInt()
  @IsPositive()
  limit: number = 20;
}
