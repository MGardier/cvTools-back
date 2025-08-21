import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import { TokenType } from 'src/user-token/enum/token-type.enum';
import { GenerateJwtOutputInterface } from './interfaces/generate-jwt-output.interface';
import { PayloadJwtInterface } from './interfaces/payload-jwt.interface';

@Injectable()
export class JwtManagerService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }


  async generate(payload: PayloadJwtInterface,
    type: TokenType,
  ): Promise<GenerateJwtOutputInterface> {
    const expiresIn = this.__getExpiration(type);
    const token = await this.jwtService.signAsync({
      ...payload
    }, {
      secret: this.__getSecret(type),
      expiresIn,
    });

   
    return { token, expiresIn };
  }

  async verify(
    token: string,
    type: TokenType,
  ): Promise<PayloadJwtInterface> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.__getSecret(type),
    });
  }


  /********************************************* PRIVATE METHOD *********************************************************************************************** */



  private __getSecret(type: TokenType): string {
    switch (type) {
      case TokenType.FORGOT_PASSWORD:
        return this.configService.get('JWT_FORGOT_PASSWORD_SECRET')!;
      case TokenType.REFRESH:
        return this.configService.get('JWT_REFRESH_SECRET')!;
      case TokenType.CONFIRM_ACCOUNT:
      default:
        return this.configService.get('JWT_DEFAULT_SECRET')!;
    }

  }


  private __getExpiration(type: TokenType): number {
    switch (type) {
      case TokenType.CONFIRM_ACCOUNT:
        return this.configService.get('JWT_CONFIRMATION_ACCOUNT_EXPIRATION')!;
      case TokenType.FORGOT_PASSWORD:
        return this.configService.get('JWT_FORGOT_PASSWORD_EXPIRATION')!;
      case TokenType.REFRESH:
        return this.configService.get('JWT_REFRESH_EXPIRATION')!;
      default:
        return this.configService.get('JWT_ACCESS_EXPIRATION')!;
    }

  }

}
