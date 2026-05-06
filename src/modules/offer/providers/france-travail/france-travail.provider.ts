import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  EOfferApiProvider,
  EOfferJobboardOrigin,
  EProviderHealthStatus,
  IHealthCheckEntry,
  IOfferListItem,
  IOfferProvider,
  IProviderHealthCheck,
  TProviderSearchFilters,
} from '../../types';
import { FranceTravailAuthService } from './france-travail-auth.service';
import { FranceTravailMapper } from './france-travail.mapper';
import {
  IAxiosLikeError,
  IFranceTravailQueryParams,
  IFranceTravailRawOffer,
  IFranceTravailSearchResponse,
  IMappedApiError,
} from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { FRANCE_TRAVAIL_ENDPOINTS } from './endpoint';


@Injectable()
export class FranceTravailProvider implements IOfferProvider {
  private readonly logger = new Logger(FranceTravailProvider.name);

  readonly name = EOfferApiProvider.FRANCE_TRAVAIL;
  readonly jobboards = [EOfferJobboardOrigin.FRANCE_TRAVAIL];
  readonly cacheTtl = 1800;


  private static readonly MAX_RESULTS = 100;
  private static readonly HEALTHCHECK_KEYWORD = 'healthcheck';

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: FranceTravailAuthService,
  ) {}

  isAvailable(): boolean {
    return this.authService.hasCredentials();
  }


  // =============================================================================
  //                               HEALTH CHECK
  // =============================================================================

  // OAuth (entreprise.francetravail.fr) and search (api.francetravail.io)
  // are two separate infrastructure systems: they are checked separately.
  async healthCheck(): Promise<IProviderHealthCheck> {
    if (!this.isAvailable()) {
      return {
        provider: this.name,
        status: EProviderHealthStatus.DOWN,
        message: 'France Travail provider is disabled',
      };
    }

    const auth = await this.__checkAuth();
    const search = auth.status === EProviderHealthStatus.OK
      ? await this.__checkSearch()
      : { status: EProviderHealthStatus.DOWN, message: 'Skipped: auth is DOWN' };

    const isUp =
      auth.status === EProviderHealthStatus.OK &&
      search.status === EProviderHealthStatus.OK;

    return {
      provider: this.name,
      status: isUp ? EProviderHealthStatus.OK : EProviderHealthStatus.DOWN,
      checks: { auth, search },
    };
  }

  // For notice : it hits the Redis cache for token
  // If Oauth is down but cache still have valid token ,this will pass.
 private async __checkAuth(): Promise<IHealthCheckEntry> {
    const start = Date.now();
    try {
      await this.authService.getAccessToken();
      return { status: EProviderHealthStatus.OK, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: EProviderHealthStatus.DOWN,
        latencyMs: Date.now() - start,
        message: (error as Error)?.message ?? 'Unknown error',
      };
    }
  }

  private async __checkSearch(): Promise<IHealthCheckEntry> {
    const start = Date.now();
    try {
      const token = await this.authService.getAccessToken();
      await firstValueFrom(
        this.httpService.get(FRANCE_TRAVAIL_ENDPOINTS.offer.search, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            motsCles: FranceTravailProvider.HEALTHCHECK_KEYWORD,
            range: '0-0',
          },
        }),
      );
      return { status: EProviderHealthStatus.OK, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: EProviderHealthStatus.DOWN,
        latencyMs: Date.now() - start,
        message: (error as Error)?.message ?? 'Unknown error',
      };
    }
  }


  // =============================================================================
  //                               SEARCH
  // =============================================================================
  
  async search(filters: TProviderSearchFilters): Promise<IOfferListItem[]> {
    const token = await this.authService.getAccessToken();
    const params = FranceTravailMapper.toProviderParams(filters);

    const rawOffers = await this.fetchOffers(token, params);
    if (!rawOffers) return [];

    return FranceTravailMapper.toOfferListItems(
      rawOffers,
      FRANCE_TRAVAIL_ENDPOINTS.offer.details,
    );
  }


  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async fetchOffers(
    token: string,
    params: IFranceTravailQueryParams,
  ): Promise<IFranceTravailRawOffer[] | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IFranceTravailSearchResponse>(
          FRANCE_TRAVAIL_ENDPOINTS.offer.search,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              ...params,
              range: `0-${FranceTravailProvider.MAX_RESULTS - 1}`,
            },
          },
        ),
      );
      
      return data.resultats ?? [];
    } catch (error) {
      if (error?.response?.status === 204) return [];

      this.__handleApiError(error);
    }
  }

  private __handleApiError(error: unknown): never {
    const axiosError = error as IAxiosLikeError;
    const status = axiosError?.response?.status;
    const message = axiosError?.message ?? 'Unknown error';
    const responseBody = axiosError?.response?.data;
    const sentParams = axiosError?.config?.params;

    const { errorCode, httpStatus } = this.__mapStatusToError(status);

    this.logger.error(
      `FT API error (${status ?? 'unknown'}): ${message} | sent=${JSON.stringify(sentParams)} | body=${JSON.stringify(responseBody)}`,
    );

    throw new HttpException(errorCode, httpStatus);
  }

  private __mapStatusToError(status?: number): IMappedApiError {
    switch (status) {
      case 400:
        return { errorCode: ErrorCodeEnum.FRANCE_TRAVAIL_INVALID_PAYLOAD, httpStatus: HttpStatus.BAD_REQUEST };
      case 401:
      case 403:
        return { errorCode: ErrorCodeEnum.FRANCE_TRAVAIL_INVALID_CREDENTIALS, httpStatus: HttpStatus.UNAUTHORIZED };
      case 429:
        return { errorCode: ErrorCodeEnum.FRANCE_TRAVAIL_RATE_LIMIT, httpStatus: HttpStatus.TOO_MANY_REQUESTS };
      default:
        return { errorCode: ErrorCodeEnum.FRANCE_TRAVAIL_API_UNAVAILABLE, httpStatus: HttpStatus.BAD_GATEWAY };
    }
  }
}