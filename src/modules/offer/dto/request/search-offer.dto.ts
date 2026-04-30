import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
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
  keyword: string;

  @IsOptional()
  @IsString()
  city?: string;

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
