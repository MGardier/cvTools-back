import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IPayloadJwt } from '#modules/jwt-manager/types.js';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token || null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_DEFAULT_SECRET'),
      //Allow passport to deny if token is expired
      ignoreExpiration: false,
    });
  }

  async validate(payload: IPayloadJwt): Promise<IPayloadJwt> {
    return payload;
  }
}
