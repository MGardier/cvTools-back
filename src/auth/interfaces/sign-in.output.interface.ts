import { User } from "@prisma/client";

export interface SignInOutputInterface {
  tokens : {
  accessToken: string;
  refreshToken: string;
  }
  user : Omit<User,"password">

}