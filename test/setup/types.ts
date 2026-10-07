import type { User } from '#prisma/generated/client.js';

export interface ITestCredentials {
  email: string;
  password: string;
}

export interface IAuthCookies {
  accessToken: string;
  refreshToken: string;
  raw: string[];
}

export interface IMockUserRef {
  current: Partial<User>;
}
