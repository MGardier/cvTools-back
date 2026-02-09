import { Request } from 'express';
import { User } from '@prisma/client';
import { IPayloadJwt } from 'src/modules/jwt-manager/types';
import { IRefreshTokenPayload } from 'src/modules/auth/strategies/jwt-refresh.strategy';

export interface IAuthenticatedRequest extends Request {
  user: IPayloadJwt;
}

export interface IRefreshTokenRequest extends Request {
  user: IRefreshTokenPayload;
}

export interface ISignInRequest extends Request {
  user: User;
}

export interface IOAuthUser {
  oauthId: string;
  email?: string;
}

export interface IOAuthRequest extends Request {
  user: IOAuthUser;
}

export interface IOAuthCallbackRequest extends Request {
  user: User;
}
