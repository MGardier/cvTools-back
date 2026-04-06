import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import {
  EContractType,
  EExperienceLevel,
  EOfferJobboardOrigin,
  ERemotePolicy,
} from '../../types';
import { val } from 'cheerio/dist/commonjs/api/attributes';

export class SearchOfferRequestDto {

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

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
  @IsIn(['24h', '7d', '14d'])
  publishedSince?: '24h' | '7d' | '14d';

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(EOfferJobboardOrigin, { each: true })
  jobboard?: EOfferJobboardOrigin[];

  @IsOptional()
  @Transform(({ value }) => (isNaN(+value) ? 1 : +value) )
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) =>(isNaN(+value) ? 20 : +value))
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}
