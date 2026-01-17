import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from './enums/token-type.enum';
import { UserTokenRepository } from './user-token.repository';
import { IGeneratedJwt, IPayloadJwt } from 'src/modules/jwt-manager/types';
import { UtilRepository } from 'src/common/utils/util-repository';
import { UserToken } from '@prisma/client';
import { IValidatedToken } from './types';
import { UtilDate } from 'src/common/utils/util-date';


@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtManagerService: JwtManagerService,
    private readonly userTokenRepository: UserTokenRepository,
  ) { }


  async generate(payload: IPayloadJwt, type: TokenType): Promise<IGeneratedJwt> {
    return await this.jwtManagerService.generate(payload, type);
  }


  async generateAndSave(payload: IPayloadJwt, type: TokenType): Promise<UserToken> {
    let uuid: string = uuidv4();
    const { token, expiresIn } = await this.generate({ ...payload, uuid }, type);
    const data = {
      token,
      type: UtilRepository.toPrismaTokenType(type),
      expiresIn: UtilDate.__convertExpiresToDate(expiresIn),
      uuid
    };

    return await this.userTokenRepository.create(data, payload.sub);
  }



  async decode(token: string, type: TokenType): Promise<IPayloadJwt> {
    return await this.jwtManagerService.verify(token, type);
  }


  async decodeAndGet(token: string, type: TokenType): Promise<IValidatedToken> {
    const payload = await this.decode(token, type);

    if (!payload.uuid)
      throw new UnauthorizedException();

    const userToken = await this.userTokenRepository.findByUuid(payload.uuid);
    if (!userToken || userToken.token !== token)
      throw new UnauthorizedException();

    return { userToken, payload };
  }


  async remove(id: number): Promise<UserToken> {
    return await this.userTokenRepository.remove(id);
  }
}
