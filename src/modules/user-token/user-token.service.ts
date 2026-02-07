import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from './enums/token-type.enum';
import { UserTokenRepository } from './user-token.repository';
import { IGeneratedJwt, IPayloadJwt } from 'src/modules/jwt-manager/types';
import { UtilRepository } from 'src/common/utils/util-repository';
import { UtilHash } from 'src/common/utils/util-hash';
import { UserToken } from '@prisma/client';
import { IValidatedToken } from './types';
import { UtilDate } from 'src/common/utils/util-date';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';

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
  ): Promise<UserToken & { token: string }> {
    const uuid: string = uuidv4();
    const { token, expiresIn } = await this.generate(
      { ...payload, uuid },
      type,
    );

    const saltRounds = Number(this.configService.get('HASH_SALT_ROUND')) || 12;
    const hashedToken = await UtilHash.hash(token, saltRounds);

    const data = {
      token: hashedToken,
      type: UtilRepository.toPrismaTokenType(type),
      expiresIn: UtilDate.__convertExpiresToDate(expiresIn),
      uuid,
    };

    const userToken = await this.userTokenRepository.create(data, payload.sub);
    return { ...userToken, token };
  }

  async decode(token: string, type: TokenType): Promise<IPayloadJwt> {
    return await this.jwtManagerService.verify(token, type);
  }

  async decodeAndGet(token: string, type: TokenType): Promise<IValidatedToken> {
    const payload = await this.decode(token, type);

    if (!payload.uuid) throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    const userToken = await this.userTokenRepository.findByUuid(payload.uuid);
    if (!userToken) throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    const isValidToken = await UtilHash.compare(token, userToken.token);
    if (!isValidToken) throw new UnauthorizedException(ErrorCodeEnum.TOKEN_INVALID);

    return { userToken, payload };
  }

  async remove(id: number): Promise<UserToken> {
    return await this.userTokenRepository.remove(id);
  }
}
