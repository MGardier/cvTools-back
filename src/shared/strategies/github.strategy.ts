import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import { User } from '@prisma/client';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { AuthService } from 'src/modules/auth/auth.service';
import { IGithubProfile } from './types';

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL')!,
      scope: ['user:email'],
      state: true,
    } as StrategyOptions & { state: boolean });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: IGithubProfile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value;

      if (!profile.id || !email || !email.includes('@'))
        throw new BadRequestException(
          ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED,
        );

      const user: User = await this.authService.validateOrCreateGithubUser(
        profile.id,
        email,
      );

      done(null, user);
    } catch (error: unknown) {
      done(error as Error, undefined);
    }
  }
}
