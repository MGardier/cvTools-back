import { Expose, Type } from 'class-transformer';
import { EOfferApiProvider, EProviderStatus } from '../../types';
import { OfferListItemResponseDto } from './offer-list-item.dto';

class ProviderSourceStatusResponseDto {
  @Expose()
  apiProvider: EOfferApiProvider;

  @Expose()
  status: EProviderStatus;

  @Expose()
  count: number;

  @Expose()
  message?: string;
}

class SearchMetaResponseDto {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  @Type(() => ProviderSourceStatusResponseDto)
  sources: ProviderSourceStatusResponseDto[];
}

export class AggregatedSearchResponseDto {
  @Expose()
  @Type(() => OfferListItemResponseDto)
  offers: OfferListItemResponseDto[];

  @Expose()
  @Type(() => SearchMetaResponseDto)
  meta: SearchMetaResponseDto;
}
