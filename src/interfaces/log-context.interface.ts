
export interface LogContextInterface {
  method: string;
  url: string;
  statusCode?: string;
  timestamp: string;
  message : string;
  stack : string;
}