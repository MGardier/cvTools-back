import type { LoginMethod } from '#prisma/generated/client.js';

export type TOAuthRedirectType = 'success' | 'error';

export interface IOAuthRedirectParams {
  loginMethod?: LoginMethod;
  errorCode?: string;
}
