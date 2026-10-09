import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, AuthGuardAuthenticateOptions } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';
import { OAuthRedirectException } from '#app/exceptions/oauth-redirect.exception.js';
import { IOAuthUser } from '#shared/types/request.types.js';

@Injectable()
export class GithubOauthGuard extends AuthGuard('github') {
  constructor(private configService: ConfigService) {
    super();
  }

  override getAuthenticateOptions(): AuthGuardAuthenticateOptions {
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

    return user;
  }
}
