import { User } from '@prisma/client';

export interface ISignInOutput {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: Omit<User, 'password' | 'createdAt' | 'updatedAt'>;
}

export interface ISignInOauthOutput extends Omit<ISignInOutput, 'user'> {}
