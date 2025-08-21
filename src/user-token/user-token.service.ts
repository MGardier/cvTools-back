import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from './enum/token-type.enum';
import { UserTokenRepository } from './user-token.repository';
import { GenerateJwtOutputInterface } from 'src/jwt-manager/interfaces/generate-jwt-output.interface';
import { UtilRepository } from 'src/utils/UtilRepository';
import { PayloadJwtInterface } from 'src/jwt-manager/interfaces/payload-jwt.interface';
import { User, UserToken } from '@prisma/client';
import { DecodeAndGetUserTokenOutput } from './interfaces/decode-and-get-user-token.output';
import { UtilDate } from 'src/utils/UtilDate';


@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtManagerService: JwtManagerService,
    private readonly userTokenRepository: UserTokenRepository,
  ) { }


  async generate(payload: PayloadJwtInterface, type: TokenType): Promise<GenerateJwtOutputInterface> {
    return await this.jwtManagerService.generate(payload, type);
  }


  async generateAndSave(payload: PayloadJwtInterface, type: TokenType, selectedColumn?: (keyof UserToken)[]): Promise<Partial<UserToken>> {
    let uuid: string = uuidv4();
    const { token, expiresIn } = await this.generate({ ...payload, uuid }, type,);
    const data = {
      token,
      type: UtilRepository.toPrismaTokenType(type),
      expiresIn: UtilDate.__convertExpiresToDate(expiresIn),
      uuid
    };

    return await this.userTokenRepository.create(data,
      payload.sub,
      selectedColumn
    );
  }



  async decode(
    token: string, type: TokenType,
  ): Promise<PayloadJwtInterface> {
    return await this.jwtManagerService.verify(
      token,
      type,
    );
  }


  async decodeAndGet(
    token: string, type: TokenType,
    selectedColumn?: (keyof UserToken)[]
  ): Promise<DecodeAndGetUserTokenOutput> {


    const payload = await this.decode(
      token,
      type,
    );


    if (!payload.uuid)
      throw new UnauthorizedException();


    const userToken = await this.userTokenRepository.findByUuid(payload.uuid, selectedColumn);
    if (userToken?.token !== token)
      throw new UnauthorizedException();

    return { userToken, payload };
  }


  async remove(
    id: number,
    selectedColumns?: (keyof UserToken)[],
  ): Promise<Partial<UserToken>> {
    return await this.userTokenRepository.remove(id, selectedColumns);
  }
}



