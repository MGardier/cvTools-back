import { LoginMethod } from "@prisma/client";

export interface SignUpInterface {
  email: string;
  password?: string;
  loginMethod : LoginMethod
  oauthId?: string;
}