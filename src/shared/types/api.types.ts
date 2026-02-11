export interface IApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  timestamp: string;
  path: string;
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

export interface IPrismaLogContext extends Omit<IHttpLogContext, 'exceptionName'> {
  prismaCode: string;
  model?: string;
  target?: string | string[];
}

export interface IStructuredLog {
  level: 'error' | 'warn' | 'info';
  timestamp: string;
  service: string;
  exceptionType: string;
  context: IHttpLogContext | IPrismaLogContext;
}
