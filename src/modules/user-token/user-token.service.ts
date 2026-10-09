import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtManagerService } from '../jwt-manager/jwt-manager.service.js';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from './enums/token-type.enum.js';
import { UserTokenRepository } from './user-token.repository.js';
import { IGeneratedJwt, IPayloadJwt } from '#modules/jwt-manager/types.js';
import { Repository } from '#shared/utils/repository.js';
import { Hash } from '#shared/utils/hash.js';
import { UserToken } from '#prisma/generated/client.js';
import { ISavedToken, IValidatedToken } from './types.js';
import { DateHelper } from '#shared/utils/date-helper.js';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';

@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtManagerService: JwtManagerService,
    private readonly userTokenRepository: UserTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    payload: IPayloadJwt,
    type: TokenType,
  ): Promise<IGeneratedJwt> {
    return await this.jwtManagerService.generate(payload, type);
  }

  async generateAndSave(
    payload: IPayloadJwt,
    type: TokenType,
  ): Promise<ISavedToken> {
    const uuid: string = uuidv4();
    const { token, expiresIn } = await this.generate(
      { ...payload, uuid },
      type,
    );

    const saltRounds = Number(this.configService.get('HASH_SALT_ROUND')) || 12;
    const hashedToken = await Hash.hash(token, saltRounds);

    const data = {
      token: hashedToken,
      type: Repository.toPrismaTokenType(type),
      expiresAt: DateHelper.__convertExpiresToDate(expiresIn),
      uuid,
    };

    const userToken = await this.userTokenRepository.create(data, payload.sub);
    return { userToken, rawToken: token };
  }

  async decode(token: string, type: TokenType): Promise<IPayloadJwt> {
    return await this.jwtManagerService.verify(token, type);
  }

  async decodeAndGet(token: string, type: TokenType): Promise<IValidatedToken> {
    let payload: IPayloadJwt;
    try {
      payload = await this.decode(token, type);
    } catch {
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);
    }

    if (!payload.uuid)
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    const userToken = await this.userTokenRepository.findByUuid(payload.uuid);
    if (!userToken)
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    const isValidToken = await Hash.compare(token, userToken.token);
    if (!isValidToken)
      throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    return { userToken, payload };
  }

  async remove(id: number): Promise<UserToken> {
    return await this.userTokenRepository.remove(id);
  }
}
