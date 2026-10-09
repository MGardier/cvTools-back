import type { ConfigService } from '@nestjs/config';
import {
  errorCodeSchema,
  oauthErrorQuerySchema,
  oauthSuccessQuerySchema,
} from '@cvtools/contracts';
import type {
  TOAuthRedirectParams,
  TOAuthRedirectType,
} from '#shared/types/auth.types.js';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';

export abstract class OAuth {
  /**
   * Builds the front return URL of an OAuth flow.
   * The query string follows @cvtools/contracts (oauthSuccessQuerySchema / oauthErrorQuerySchema).
   */
  static buildRedirectUrl<T extends TOAuthRedirectType>(
    configService: ConfigService,
    type: T,
    params: TOAuthRedirectParams<T>,
  ): string {
    const baseUrl =
      type === 'success'
        ? configService.get<string>('FRONT_URL_OAUTH_CALLBACK_SUCCESS')
        : configService.get<string>('FRONT_URL_OAUTH_CALLBACK_ERROR');

    const query =
      type === 'success'
        ? oauthSuccessQuerySchema.parse(params)
        : oauthErrorQuerySchema.parse(params);

    return `${baseUrl}?${new URLSearchParams(query).toString()}`;
  }

  // Maps  error => ErrorCodeEnum  or => INTERNAL_SERVER_ERROR
  static resolveErrorCode(error: unknown): ErrorCodeEnum {
    const message = error instanceof Error ? error.message : '';
    const parsed = errorCodeSchema.safeParse(message);

    return parsed.success ? parsed.data : ErrorCodeEnum.INTERNAL_SERVER_ERROR;
  }
}
