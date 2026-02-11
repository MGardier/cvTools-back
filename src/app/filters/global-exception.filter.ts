import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { OAuthRedirectException } from 'src/shared/exceptions/oauth-redirect.exception';
import { IHttpLogContext, IStructuredLog } from 'src/shared/types/api.types';
import { HttpExceptionFilter } from './http-exception.filter';
import { PrismaClientExceptionFilter } from './prisma-exception.filter';

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

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.prismaFilter.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      return this.httpFilter.catch(exception, host);
    }

    this.handleUnknownException(exception, request, response);
  }

  private handleUnknownException(
    exception: unknown,
    request: Request,
    response: Response,
  ): void {
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    const logContext = this.buildLogContext(error, request);
    this.logStructuredError(logContext, error.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private buildLogContext(error: Error, request: Request): IHttpLogContext {
    const user = request.user as { id?: string } | undefined;

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
    const formattedLines = lines
      .map((line) => `\n║   ${line.trim()}`)
      .join('');

    return `\n║ Stack      :${formattedLines}`;
  }
}
