import { LoginMethod, UserStatus } from '@prisma/client';

export interface ICreateUser {
  email: string;
  password?: string;
  loginMethod: LoginMethod;
  oauthId?: string;
  status?: UserStatus;
}

export interface IUpdateUser {
  email?: string;
  password?: string;
  status?: UserStatus;
  loginMethod?: LoginMethod;
  oauthId?: string;
}

export interface IFindOneByOauthId {
  oauthId: string;
  loginMethod: LoginMethod;
}
