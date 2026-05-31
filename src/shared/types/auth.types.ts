import { LoginMethod } from "@prisma/client";

export type TOAuthRedirectType = 'success' | 'error';

export interface IOAuthRedirectParams {
  loginMethod?: LoginMethod;
  errorCode?: string;
}
