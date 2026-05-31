import { ConfigService } from '@nestjs/config';
import { LoginMethod } from '@prisma/client';
import { IOAuthRedirectParams, TOAuthRedirectType } from '../types/auth.types';


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
}
