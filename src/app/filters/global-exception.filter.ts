import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { Request, Response } from 'express';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { OAuthRedirectException } from 'src/shared/exceptions/oauth-redirect.exception';
import { ILogContext } from 'src/shared/types/api.types';
import { PrismaClientExceptionFilter } from './prisma-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';

//TODO: Improve display of error for all filters
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly prismaFilter: PrismaClientExceptionFilter,
    private readonly httpFilter: HttpExceptionFilter,
  ) {}
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Skip OAuth redirect exceptions to stop the request lifecycle - those are already sent
    if (exception instanceof OAuthRedirectException) return;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Safety check: don't attempt to send a response if headers were already sent
    if (response.headersSent) return;

    const logContext = this.buildLogContext(request, exception);

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.prismaFilter.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      return this.httpFilter.catch(exception, host);
    }
    this.logUnhandledException(logContext);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private buildLogContext(request: Request, exception: unknown): ILogContext {
    return {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack:
        exception instanceof Error && exception.stack
          ? exception.stack
          : 'No stack',
    };
  }

  private logUnhandledException(context: ILogContext): void {
    const { method, url, timestamp, message, stack } = context;

    this.logger.error(
      `❌ Unhandled Exception: ${method} ${url} - ${timestamp}`,
    );
    this.logger.error(`Error : ${message} \nStack: ${stack}\n`);
  }
}
