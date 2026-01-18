import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { IOAuthUser } from 'src/common/types/request.types';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super();
  }

  override handleRequest<TUser = IOAuthUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const response = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      const errorMessage = err instanceof Error ? err.message : '';
      const errorCode = Object.values(ErrorCodeEnum).includes(
        errorMessage as ErrorCodeEnum,
      )
        ? errorMessage
        : ErrorCodeEnum.INTERNAL_SERVER_ERROR;
      const redirectUrl = `${this.configService.get('FRONT_URL_OAUTH_CALLBACK_ERROR')}?errorCode=${encodeURIComponent(errorCode)}`;

      response.redirect(redirectUrl);
      return undefined as TUser;
    }

    return user;
  }
}
