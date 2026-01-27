import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';
import { IApiResponse } from 'src/common/types/api.types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T>> {
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
