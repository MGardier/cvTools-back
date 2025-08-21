import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

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

      scope: ['email', 'profile'],
      // // Options supplémentaires
      // passReqToCallback: true,
      // prompt: 'select_account',
      // accessType: 'offline',
      // state: true, // CSRF PROTECTION
    });
    


  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {

      const {  id,emails } = profile;
      const user = await this.authService.validateOrCreateGoogleUser({
        googleId: id,
        email: emails[0].value,
  
        accessToken,
        refreshToken,
      });
      done(null, user);
    } catch (error) {
     
      done(error, null);
    }
  }
}