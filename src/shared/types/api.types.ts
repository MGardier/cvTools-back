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
