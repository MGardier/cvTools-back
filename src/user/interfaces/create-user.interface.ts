import { LoginMethod, UserStatus } from "@prisma/client";

export interface CreateUserInterface {
  email: string;
  password?: string;
  loginMethod : LoginMethod
  oauthId?: string;
  status?: UserStatus;
}