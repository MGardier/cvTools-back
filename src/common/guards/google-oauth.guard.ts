import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { OAuthRedirectException } from 'src/common/exceptions/oauth-redirect.exception';
import { IOAuthUser } from 'src/common/types/request.types';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super();
  }

  override getAuthenticateOptions(): IAuthModuleOptions {
    return { session: false };
  }

  override handleRequest<TUser = IOAuthUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    //Prevent double api call at handleRequest
    if (
      request.user &&
      typeof request.user === 'object' &&
      'id' in request.user
    ) {
      return request.user as TUser;
    }

    if (response.headersSent) {
      throw new OAuthRedirectException();
    }

    if (err || !user) {
      const errorMessage = err instanceof Error ? err.message : '';
      const errorCode = Object.values(ErrorCodeEnum).includes(
        errorMessage as ErrorCodeEnum,
      )
        ? errorMessage
        : ErrorCodeEnum.INTERNAL_SERVER_ERROR;

      const redirectUrl = `${this.configService.get('FRONT_URL_OAUTH_CALLBACK_ERROR')}?errorCode=${encodeURIComponent(errorCode)}`;
      response.redirect(redirectUrl);
      throw new OAuthRedirectException();
    }

    return user as TUser;
  }
}
