import { LoginMethod } from 'prisma/generated/client';

export type TOAuthRedirectType = 'success' | 'error';

export interface IOAuthRedirectParams {
  loginMethod?: LoginMethod;
  errorCode?: string;
}
