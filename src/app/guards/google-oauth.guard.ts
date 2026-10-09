import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, AuthGuardAuthenticateOptions } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { OAuthRedirectException } from '#app/exceptions/oauth-redirect.exception.js';
import { IOAuthUser } from '#shared/types/request.types.js';
import { OAuth } from '#shared/utils/oauth.js';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
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
      response.redirect(
        OAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: OAuth.resolveErrorCode(err),
        }),
      );
      throw new OAuthRedirectException();
    }

    return user;
  }
}
