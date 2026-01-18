import { Request } from 'express';
import { User } from '@prisma/client';
import { IPayloadJwt } from 'src/modules/jwt-manager/types';

export interface IAuthenticatedRequest extends Request {
  user: IPayloadJwt;
  token?: string;
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
