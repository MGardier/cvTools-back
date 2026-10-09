import { BadRequestException, HttpException } from '@nestjs/common';
import { ORPCError, ValidationError } from '@orpc/server';
import type { ORPCGlobalContext } from '@orpc/nest';
import type { Request } from 'express';
import type { GlobalExceptionFilter } from '#app/filters/global-exception.filter.js';
import { ErrorResponse } from '#shared/utils/error-response.js';
import './types.js';

/**
 * Error boundary of the oRPC contract routes (registered in ORPCModule `interceptors`).
 * Every error thrown by a contract route is logged and mapped by GlobalExceptionFilter,
 * then re-thrown as an ORPCError in the shared error format.
 */
export abstract class ContractErrorBoundary {
  static create(globalFilter: GlobalExceptionFilter) {
    return async ({
      next,
      context,
    }: {
      next: () => Promise<unknown>;
      context: ORPCGlobalContext;
    }): Promise<unknown> => {
      try {
        return await next();
      } catch (error) {
        const request: Request = context.request;
        const descriptor = globalFilter.logAndMapError(
          ContractErrorBoundary.toNestException(error),
          request,
        );

        throw new ORPCError(descriptor.code, {
          status: descriptor.status,
          message: descriptor.code,
          data: ErrorResponse.buildData(descriptor, request),
          cause: error,
        });
      }
    };
  }

  /**
   * Converts oRPC-native errors to the exceptions the Nest filters already know:
   * - input validation failure → BadRequestException(messages) → VALIDATION_ERROR + errors[]
   * - other ORPCError → HttpException(code, status)
   * Output validation failures and unknown errors fall through to a logged 500.
   */
  private static toNestException(error: unknown): unknown {
    if (!(error instanceof ORPCError)) return error;

    const cause: unknown = error.cause;
    if (cause instanceof ValidationError) {
      return error.code === 'BAD_REQUEST'
        ? new BadRequestException(cause.issues.map((issue) => issue.message))
        : cause;
    }

    return new HttpException(error.message, error.status);
  }
}
