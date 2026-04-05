import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { IHttpLogContext, IStructuredLog } from 'src/shared/types/api.types';

type LogFormat = 'json' | 'visual' | 'both';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly serviceName = 'cvtools-back';

  constructor(private readonly configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    const logContext = this.buildLogContext(exception, request, statusCode);
    this.logStructuredError(logContext);

    const exceptionResponse = exception.getResponse();
    const isValidationError =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray((exceptionResponse as Record<string, unknown>).message);

    response.status(statusCode).json({
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(isValidationError
        ? {
            message: ErrorCodeEnum.VALIDATION_ERROR,
            errors: (exceptionResponse as Record<string, unknown>)
              .message as string[],
          }
        : { message: exception.message }),
    });
  }

  private buildLogContext(
    exception: HttpException,
    request: Request,
    statusCode: number,
  ): IHttpLogContext {
    const user = request.user as { id?: string; email?: string } | undefined;

    return {
      method: request.method,
      path: request.url,
      statusCode,
      statusText: HttpStatus[statusCode] || 'UNKNOWN',
      exceptionName: exception.constructor.name,
      message: exception.message,
      userId: user?.id,
      body: this.sanitizeBody(request.body),
      query:
        Object.keys(request.query).length > 0
          ? (request.query as Record<string, unknown>)
          : undefined,
      stack: exception.stack,
    };
  }

  private sanitizeBody(
    body: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!body || Object.keys(body).length === 0) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private logStructuredError(context: IHttpLogContext): void {
    const logFormat =
      this.configService.get<LogFormat>('LOG_FORMAT') || 'visual';
    const timestamp = new Date().toISOString();

    if (logFormat === 'json' || logFormat === 'both') {
      const structuredLog: IStructuredLog = {
        level: 'error',
        timestamp,
        service: this.serviceName,
        exceptionType: 'HttpException',
        context,
      };
      this.logger.error(JSON.stringify(structuredLog));
    }

    if (logFormat === 'visual' || logFormat === 'both') {
      const contextLines = this.buildContextLines(context);

      this.logger.error(
        `\n${'═'.repeat(70)}` +
          `\n║ HTTP EXCEPTION: ${context.exceptionName}` +
          `\n${'─'.repeat(70)}` +
          `\n║ Status     : ${context.statusCode} ${context.statusText}` +
          `\n║ Method     : ${context.method}` +
          `\n║ Path       : ${context.path}` +
          `\n║ Message    : ${context.message}` +
          contextLines +
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
    if (context.body) {
      lines += `\n║ Body       : ${JSON.stringify(context.body)}`;
    }
    if (context.query) {
      lines += `\n║ Query      : ${JSON.stringify(context.query)}`;
    }

    return lines;
  }
}
