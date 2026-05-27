import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CacheManagerService } from 'src/modules/cache/cache-manager.service';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { IFranceTravailTokenResponse } from './types';
import { FRANCE_TRAVAIL_ENDPOINTS } from './endpoint';

@Injectable()
export class FranceTravailAuthService {
  private readonly logger = new Logger(FranceTravailAuthService.name);

  private static readonly TOKEN_CACHE_KEY = 'france-travail:auth:token';
  private static readonly SCOPE = 'api_offresdemploiv2 o2dsoffre';
  private static readonly TOKEN_EXPIRY_MARGIN = 60; //in seconds

  //To prevent multiple request for access token
  private pendingTokenRequest: Promise<string> | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  async getAccessToken(): Promise<string> {
    const cached = await this.cacheManagerService.get<string>(
      FranceTravailAuthService.TOKEN_CACHE_KEY,
    );

    if (cached) return cached;

    if (this.pendingTokenRequest) return this.pendingTokenRequest;

    this.pendingTokenRequest = this.__requestNewToken().finally(
      () => (this.pendingTokenRequest = null),
    );
    return this.pendingTokenRequest;
  }

  private async __requestNewToken(): Promise<string> {
    const clientId = this.configService.getOrThrow<string>(
      'FRANCE_TRAVAIL_CLIENT_ID',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'FRANCE_TRAVAIL_CLIENT_SECRET',
    );

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: FranceTravailAuthService.SCOPE,
    });

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<IFranceTravailTokenResponse>(
          FRANCE_TRAVAIL_ENDPOINTS.token,
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      const ttl =
        data.expires_in - FranceTravailAuthService.TOKEN_EXPIRY_MARGIN;

      await this.cacheManagerService.set(
        FranceTravailAuthService.TOKEN_CACHE_KEY,
        data.access_token,
        Math.max(ttl, 60) * 1000,
      );

      this.logger.log(
        `Token obtained, expires in ${data.expires_in}s (cached ${ttl}s)`,
      );

      return data.access_token;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        this.__handleAxiosError(error);
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'Failed to obtain France Travail access token',
        message,
      );
      throw new HttpException(
        ErrorCodeEnum.FRANCE_TRAVAIL_API_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  hasCredentials(): boolean {
    return this.configService.get<boolean>('FRANCE_TRAVAIL_ENABLED') || false;
  }

  private __handleAxiosError(error: AxiosError) {
    const status = error.response?.status;

    this.logger.error(
      `France Travail token request failed (HTTP ${status}): ${error.message}`,
    );

    switch (status) {
      case 400:
        throw new BadRequestException(
          ErrorCodeEnum.FRANCE_TRAVAIL_INVALID_PAYLOAD,
        );
      case 401:
        throw new UnauthorizedException(
          ErrorCodeEnum.FRANCE_TRAVAIL_INVALID_CREDENTIALS,
        );
      case 429:
        throw new HttpException(
          ErrorCodeEnum.FRANCE_TRAVAIL_RATE_LIMIT,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      default:
        throw new HttpException(
          ErrorCodeEnum.FRANCE_TRAVAIL_API_UNAVAILABLE,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
  }
}
