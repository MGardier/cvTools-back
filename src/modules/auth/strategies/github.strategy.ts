//auth.strategy.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { AuthService } from '../auth.service';
import { Strategy, VerifyCallback } from 'passport-github2';




@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService,
    private authService: AuthService,) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {


    try{
        let email = profile.emails?.[0]?.value

    if (!profile.id || (!email || !email.includes('@')))
      throw new BadRequestException(ErrorCodeEnum.GITHUB_COMPLETED_OAUTH_FAILED)


    const user = await this.authService.validateOrCreateGithubUser(
      profile.id,
      email
    );
    done(null, user);
    }catch(error){
      done(error, null);
    }

    


  }
}
