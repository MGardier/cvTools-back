import { PrismaTokenType, UserToken } from '@prisma/client';
import { IPayloadJwt } from 'src/modules/jwt-manager/types';

export interface ICreateUserToken {
  token: string;
  type: PrismaTokenType;
  expiresAt: Date;
  uuid?: string;
}


export interface ISavedToken {
  userToken: UserToken;
  rawToken: string;
}

export interface IValidatedToken {
  userToken: UserToken;
  payload: IPayloadJwt;
}

