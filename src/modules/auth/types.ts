import type { User } from '#prisma/generated/client.js';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthSession {
  tokens: IAuthTokens;
  user: User;
}
