import { Expose, Type } from 'class-transformer';
import {
  EContractType,
  EExperienceLevel,
  EOfferAPiProvider,
  EOfferJobboardOrigin,
  ERemotePolicy,
} from '../../types';

class LocationResponseDto {
  @Expose()
  city?: string;

  @Expose()
  postalCode?: string;

  @Expose()
  department?: string;

  @Expose()
  region?: string;

  @Expose()
  raw?: string;
}

class SalaryResponseDto {
  @Expose()
  min?: number;

  @Expose()
  max?: number;

  @Expose()
  raw?: string;
}

class ExperienceResponseDto {
  @Expose()
  level?: EExperienceLevel;

  @Expose()
  raw?: string;
}

export class OfferListItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  externalId?: string;

  @Expose()
  title: string;

  @Expose()
  company?: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  @Expose()
  contractType?: EContractType;

  @Expose()
  @Type(() => SalaryResponseDto)
  salary?: SalaryResponseDto;

  @Expose()
  remote?: ERemotePolicy;

  @Expose()
  publishedAt: string;

  @Expose()
  url: string;

  @Expose()
  jobboard: EOfferJobboardOrigin;

  @Expose()
  apiProvider: EOfferAPiProvider;

  @Expose()
  @Type(() => ExperienceResponseDto)
  experience?: ExperienceResponseDto;

  @Expose()
  skills: string[];
}
