import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Prisma } from '#prisma/generated/client.js';

import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';
import { OAuthRedirectException } from '#app/exceptions/oauth-redirect.exception.js';
import {
  IErrorDescriptor,
  IHttpLogContext,
  IStructuredLog,
} from '#shared/types/api.types.js';
import { ErrorResponse } from '#shared/utils/error-response.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { PrismaClientExceptionFilter } from './prisma-exception.filter.js';

type LogFormat = 'json' | 'visual' | 'both';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly serviceName = 'cvtools-back';

  constructor(
    private readonly prismaFilter: PrismaClientExceptionFilter,
    private readonly httpFilter: HttpExceptionFilter,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof OAuthRedirectException) return;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) return;

    ErrorResponse.send(
      response,
      request,
      this.logAndMapError(exception, request),
    );
  }

  /** Logs any exception and maps it to { status, code, errors? }. Must not send the response: also called by ContractErrorBoundary (oRPC routes). */
  logAndMapError(exception: unknown, request: Request): IErrorDescriptor {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.prismaFilter.logAndMapError(exception, request);
    }

    if (exception instanceof HttpException) {
      return this.httpFilter.logAndMapError(exception, request);
    }

    return this.handleUnknownException(exception, request);
  }

  // =============================================================================
  //                            PRIVATE
  // =============================================================================

  private handleUnknownException(
    exception: unknown,
    request: Request,
  ): IErrorDescriptor {
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    const logContext = this.buildLogContext(error, request);
    this.logStructuredError(logContext, error.stack);

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    };
  }

  private buildLogContext(error: Error, request: Request): IHttpLogContext {
    const user: { id?: string } | undefined = request.user;

    return {
      method: request.method,
      path: request.url,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      statusText: 'INTERNAL_SERVER_ERROR',
      exceptionName: error.constructor.name,
      message: error.message || 'Unknown error',
      userId: user?.id,
      errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    };
  }

  private logStructuredError(context: IHttpLogContext, stack?: string): void {
    const logFormat =
      this.configService.get<LogFormat>('LOG_FORMAT') || 'visual';
    const timestamp = new Date().toISOString();

    if (logFormat === 'json' || logFormat === 'both') {
      const structuredLog: IStructuredLog = {
        level: 'error',
        timestamp,
        service: this.serviceName,
        exceptionType: 'UnhandledException',
        context,
      };
      this.logger.error(JSON.stringify(structuredLog));
    }

    if (logFormat === 'visual' || logFormat === 'both') {
      const contextLines = this.buildContextLines(context);
      const stackLines = this.formatStack(stack);

      this.logger.error(
        `\n${'═'.repeat(70)}` +
          `\n║ UNHANDLED EXCEPTION: ${context.exceptionName}` +
          `\n${'─'.repeat(70)}` +
          `\n║ Status     : ${context.statusCode} ${context.statusText}` +
          `\n║ Method     : ${context.method}` +
          `\n║ Path       : ${context.path}` +
          `\n║ Message    : ${context.message}` +
          contextLines +
          stackLines +
          `\n${'─'.repeat(70)}` +
          `\n║ Timestamp  : ${timestamp}` +
          `\n${'═'.repeat(70)}`,
      );
    }
  }

  private buildContextLines(context: IHttpLogContext): string {
    let lines = '';

    if (context.userId) {
      lines += `\n║ User ID    : ${context.userId}`;
    }

    return lines;
  }

  private formatStack(stack?: string): string {
    if (!stack) return '';

    const lines = stack.split('\n').slice(1, 4);
    const formattedLines = lines.map((line) => `\n║   ${line.trim()}`).join('');

    return `\n║ Stack      :${formattedLines}`;
  }
}
