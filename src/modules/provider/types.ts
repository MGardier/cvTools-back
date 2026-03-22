import { ExternalProvider, HttpMethod, Prisma } from '@prisma/client';

/********* INTERFACES *********/

export interface ICreateProviderLog {
  statusCode: number;
  operationPath: string;
  method: HttpMethod;
  provider: ExternalProvider;
  request: Prisma.InputJsonValue;
  response: Prisma.InputJsonValue;
  usedBy: number;
}

export interface IUpdateProviderUsage {
  userId: number;
  provider: ExternalProvider;
  tokensConsumed: number;
}
