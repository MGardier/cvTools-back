import { User } from '@prisma/client';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthSession {
  tokens: IAuthTokens;
  user: User;
}

export type TUserAccountStatus = Pick<User, 'id' | 'email' | 'status'>;
