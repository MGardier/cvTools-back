import type { Request } from 'express';

// Global context available in every oRPC handler and interceptor.
declare module '@orpc/nest' {
  interface ORPCGlobalContext {
    request: Request;
  }
}
