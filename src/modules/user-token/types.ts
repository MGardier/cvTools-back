import type { PrismaTokenType, UserToken } from '#prisma/generated/client.js';
import type { IPayloadJwt } from '#modules/jwt-manager/types.js';

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
