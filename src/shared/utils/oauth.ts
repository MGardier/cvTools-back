import type { ConfigService } from '@nestjs/config';
import type {
  IOAuthRedirectParams,
  TOAuthRedirectType,
} from '#src/shared/types/auth.types.js';
import { ErrorCodeEnum } from '#src/shared/enums/error-codes.enum.js';

export abstract class OAuth {
  static buildRedirectUrl(
    configService: ConfigService,
    type: TOAuthRedirectType,
    params: IOAuthRedirectParams,
  ): string {
    const baseUrl =
      type === 'success'
        ? configService.get<string>('FRONT_URL_OAUTH_CALLBACK_SUCCESS')
        : configService.get<string>('FRONT_URL_OAUTH_CALLBACK_ERROR');

    const searchParams = new URLSearchParams();

    if (type === 'success' && params.loginMethod) {
      searchParams.set('loginMethod', params.loginMethod);
    } else if (type === 'error' && params.errorCode) {
      searchParams.set('errorCode', params.errorCode);
    }

    return `${baseUrl}?${searchParams.toString()}`;
  }

  // Maps  error => ErrorCodeEnum  or => INTERNAL_SERVER_ERROR
  static resolveErrorCode(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    return Object.values(ErrorCodeEnum).includes(message as ErrorCodeEnum)
      ? message
      : ErrorCodeEnum.INTERNAL_SERVER_ERROR;
  }
}
