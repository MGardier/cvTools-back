import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { Request, Response } from 'express';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { OAuthRedirectException } from 'src/shared/exceptions/oauth-redirect.exception';
import { TAdminOAuthIdentity } from 'src/shared/types/request.types';
import { UtilOAuth } from 'src/shared/utils/oauth.util';

@Injectable()
export class GoogleAdminOauthGuard extends AuthGuard('google-admin') {
  constructor(private configService: ConfigService) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Init leg only (no /callback): the token is in the query, so stash it in
    // session before redirecting to the provider. On the callback leg the
    // provider sends back only code/state — the token's presence is then read
    // and validated by the controller, not here.
    if (!request.path.endsWith('/callback')) {
      const token = request.query.token;

      if (typeof token !== 'string' || !token) {
        const response = context.switchToHttp().getResponse<Response>();
        response.redirect(
          UtilOAuth.buildRedirectUrl(this.configService, 'error', {
            errorCode: ErrorCodeEnum.ADMIN_INVITATION_TOKEN_MISSING,
          }),
        );
        throw new OAuthRedirectException();
      }

      request.session.adminInvitationToken = token;
    }

    return (await super.canActivate(context)) as boolean;
  }

  override getAuthenticateOptions(): IAuthModuleOptions {
    return { session: false };
  }

  override handleRequest<TUser = TAdminOAuthIdentity>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const response = context.switchToHttp().getResponse<Response>();

    if (response.headersSent) throw new OAuthRedirectException();

    if (err || !user) {
      response.redirect(
        UtilOAuth.buildRedirectUrl(this.configService, 'error', {
          errorCode: UtilOAuth.resolveErrorCode(err),
        }),
      );
      throw new OAuthRedirectException();
    }

    return user as TUser;
  }
}
