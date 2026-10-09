import type { Request, Response } from 'express';
import type { TErrorData } from '@cvtools/contracts';
import type {
  IErrorDescriptor,
  IErrorResponseBody,
} from '#shared/types/api.types.js';

/**
 * Builds the error response body shared by every route (oRPC error format):
 * `{ defined, code, status, message, data: { errors?, path, timestamp } }`.
 * Used by the Nest exception filters and by the oRPC error interceptor.
 */
export abstract class ErrorResponse {
  static buildData(descriptor: IErrorDescriptor, request: Request): TErrorData {
    return {
      ...(descriptor.errors ? { errors: descriptor.errors } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };
  }

  static buildBody(
    descriptor: IErrorDescriptor,
    request: Request,
  ): IErrorResponseBody {
    return {
      defined: false,
      code: descriptor.code,
      status: descriptor.status,
      message: descriptor.code,
      data: ErrorResponse.buildData(descriptor, request),
    };
  }

  static send(
    response: Response,
    request: Request,
    descriptor: IErrorDescriptor,
  ): void {
    response
      .status(descriptor.status)
      .json(ErrorResponse.buildBody(descriptor, request));
  }
}
