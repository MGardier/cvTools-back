//auth.strategy.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ErrorCodeEnum } from 'src/enums/error-codes.enum';
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

    if (!profile.id)
      throw new BadRequestException(ErrorCodeEnum.GITHUB_ID_MISSING_ERROR)

    let email = profile.emails?.[0]?.value

      if(!email)
         throw new BadRequestException(ErrorCodeEnum.GITHUB_EMAIL_MISSING_ERROR)

     
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
