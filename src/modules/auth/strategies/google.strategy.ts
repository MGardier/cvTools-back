import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { IGoogleProfile } from './types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
      prompt: 'select_account',
      accessType: 'offline',
      state: true,
    });
  }

  async validate(
    _req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: IGoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails[0]?.value;
      if (!profile.id || !email || !email.includes('@'))
        throw new BadRequestException(
          ErrorCodeEnum.GOOGLE_COMPLETED_OAUTH_FAILED,
        );

      const user: User = await this.authService.validateOrCreateGoogleUser(
        profile.id,
        email,
      );

      done(null, user);
    } catch (error: unknown) {
      done(error as Error, undefined);
    }
  }
}
