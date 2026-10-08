import type { TErrorData } from '@cvtools/contracts';

export interface IApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  timestamp: string;
  path: string;
}

/** Route metadata carried by an oRPC contract procedure (`~orpc`). */
export interface IOrpcRouteMeta {
  route?: { successStatus?: number };
}

/** Result of mapping any exception to an HTTP error (status + code). */
export interface IErrorDescriptor {
  status: number;
  code: string;
  errors?: string[];
}

/** Error response body, oRPC error format (also used by Nest filters). */
export interface IErrorResponseBody {
  defined: false;
  code: string;
  status: number;
  message: string;
  data: TErrorData;
}

export interface ILogContext {
  method: string;
  url: string;
  statusCode?: string;
  timestamp: string;
  message: string;
  stack: string;
}

export interface IHttpLogContext {
  method: string;
  path: string;
  statusCode: number;
  statusText: string;
  errorCode?: string;
  exceptionName: string;
  message: string;
  userId?: string;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  stack?: string;
}

export interface IPrismaLogContext extends Omit<
  IHttpLogContext,
  'exceptionName'
> {
  prismaCode: string;
  model?: string;
  target?: string | string[];
}

export interface IPrismaDriverAdapterErrorMeta {
  cause?: {
    constraint?: { fields?: string[]; index?: string };
  };
}

export interface IStructuredLog {
  level: 'error' | 'warn' | 'info';
  timestamp: string;
  service: string;
  exceptionType: string;
  context: IHttpLogContext | IPrismaLogContext;
}
