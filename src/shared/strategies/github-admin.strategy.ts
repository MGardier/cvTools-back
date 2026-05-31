import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { IGithubProfile } from './types';
import { TAdminOAuthIdentity } from 'src/shared/types/request.types';

@Injectable()
export class GithubAdminStrategy extends PassportStrategy(
  Strategy,
  'github-admin',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_ADMIN_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_ADMIN_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_ADMIN_CALLBACK_URL')!,
      scope: ['user:email'],
      state: true,
    } as StrategyOptions & { state: boolean });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: IGithubProfile,
    done: VerifyCallback,
  ): void {
    try {
      if (!profile.id)
        throw new BadRequestException(
          ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED,
        );

      const email = this.__selectVerifiedEmail(profile.emails);

      if (!email)
        throw new BadRequestException(ErrorCodeEnum.OAUTH_EMAIL_NOT_AVAILABLE);

      const identity: TAdminOAuthIdentity = { oauthId: profile.id, email };

      done(null, identity);
    } catch (error: unknown) {
      done(error as Error, undefined);
    }
  }

  // primary && verified → first verified → none
  private __selectVerifiedEmail(
    emails?: Array<{ value: string; primary?: boolean; verified?: boolean }>,
  ): string | null {
    if (!emails?.length) return null;

    const primaryVerified = emails.find((e) => e.primary && e.verified);
    if (primaryVerified) return primaryVerified.value;

    const firstVerified = emails.find((e) => e.verified);

    return firstVerified?.value ?? null;
  }
}
