import { LoginMethod } from "@prisma/client";

export interface FindOneByOauthIdInterface {
  oauthId: string;
  loginMethod: LoginMethod;
}