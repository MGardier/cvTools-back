import { REQUEST } from '@nestjs/core';
import { ORPCModule } from '@orpc/nest';
import type { Request } from 'express';
import { FiltersModule } from '#app/filters/filters.module.js';
import { GlobalExceptionFilter } from '#app/filters/global-exception.filter.js';
import { ContractErrorBoundary } from './contract-error-boundary.js';
import './types.js';

// Request-scoped: the express request is injected in the oRPC context
// (needed for error logging, error `data.path` and the success envelope).
export const OrpcModule = ORPCModule.forRootAsync({
  imports: [FiltersModule],
  inject: [REQUEST, GlobalExceptionFilter],
  useFactory: (request: Request, globalFilter: GlobalExceptionFilter) => ({
    context: { request },
    interceptors: [ContractErrorBoundary.create(globalFilter)],
  }),
});
