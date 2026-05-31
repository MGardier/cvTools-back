import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { IGoogleProfile } from './types';
import { TAdminOAuthIdentity } from 'src/shared/types/request.types';

@Injectable()
export class GoogleAdminStrategy extends PassportStrategy(
  Strategy,
  'google-admin',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_ADMIN_CALLBACK_URL')!,
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state: true,
    } as StrategyOptions & { state: boolean });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: IGoogleProfile,
    done: VerifyCallback,
  ): void {
    try {
      const primaryEmail = profile.emails[0];

      if (
        !profile.id ||
        !primaryEmail?.value ||
        !primaryEmail.value.includes('@')
      )
        throw new BadRequestException(
          ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED,
        );

      if (!primaryEmail.verified)
        throw new BadRequestException(ErrorCodeEnum.OAUTH_EMAIL_NOT_VERIFIED);

      const identity: TAdminOAuthIdentity = {
        oauthId: profile.id,
        email: primaryEmail.value,
      };

      done(null, identity);
    } catch (error: unknown) {
      done(error as Error, undefined);
    }
  }
}
