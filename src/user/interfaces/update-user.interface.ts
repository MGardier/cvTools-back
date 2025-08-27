import { UserStatus, LoginMethod } from '@prisma/client';

export interface UpdateUserInterface {

  email?: string;
  password?: string;
  status?: UserStatus;
  loginMethod?: LoginMethod;
  oauthId?: string;
}