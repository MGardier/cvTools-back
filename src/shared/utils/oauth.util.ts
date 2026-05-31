import { ConfigService } from '@nestjs/config';
import { IOAuthRedirectParams, TOAuthRedirectType } from '../types/auth.types';
import { ErrorCodeEnum } from '../enums/error-codes.enum';

export abstract class UtilOAuth {
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
