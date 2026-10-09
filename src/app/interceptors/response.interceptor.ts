import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response, Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IApiResponse } from '#shared/types/api.types.js';
import { ContractRoute } from '#shared/utils/contract-route.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T>> {
    // oRPC contract routes build their own envelope (ContractRoute.buildSuccessResponse()) and write the response.
    if (ContractRoute.isContractRoute(this.reflector, context)) {
      return next.handle() as Observable<IApiResponse<T>>;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next
      .handle()
      .pipe(
        map((data: T) =>
          this.transformResponse(data, request.url, response?.statusCode),
        ),
      );
  }

  private transformResponse(
    data: T,
    path: string,
    status: number,
  ): IApiResponse<T> {
    return {
      data,
      status: status || 200,
      success: true,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}
