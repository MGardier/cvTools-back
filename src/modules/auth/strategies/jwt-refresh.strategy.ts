import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IPayloadJwt } from 'src/modules/jwt-manager/types';
import { UserTokenService } from 'src/modules/user-token/user-token.service';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';

export interface IRefreshTokenPayload extends IPayloadJwt {
  refreshToken: string;
  userTokenId: number;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly userTokenService: UserTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token || null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        //Allow passport to deny if token is expired
      ignoreExpiration: false,
      passReqToCallback: true,
    } as const);
  }

  async validate(req: Request, payload: IPayloadJwt): Promise<IRefreshTokenPayload> {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const { userToken } = await this.userTokenService.decodeAndGet(
      refreshToken,
      TokenType.REFRESH,
    );

    return {
      ...payload,
      refreshToken,
      userTokenId: userToken.id,
    };
  }
}
