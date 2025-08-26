import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ErrorCodeEnum } from '../../enums/error-codes.enum';
import { Request } from 'express';

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
      // Options supplémentaires
      passReqToCallback: true,
      prompt: 'select_account',
      accessType: 'offline',
      state: true, // CSRF PROTECTION
    });



  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {

      const email = profile.emails[0]?.value;
      if (!profile.id)
        throw new BadRequestException(ErrorCodeEnum.GOOGLE_ID_MISSING_ERROR)
      if (!email ||  !email.includes('@'))
        throw new BadRequestException(ErrorCodeEnum.GOOGLE_EMAIL_MISSING_ERROR)
      const user = await this.authService.validateOrCreateGoogleUser(
        profile.id,
        email
      );

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}