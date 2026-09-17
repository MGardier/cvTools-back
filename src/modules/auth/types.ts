import { User } from 'prisma/generated/client';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthSession {
  tokens: IAuthTokens;
  user: User;
}
