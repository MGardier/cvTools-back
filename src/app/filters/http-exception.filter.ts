import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { errorCodeSchema } from '@cvtools/contracts';
import { ErrorCodeEnum } from '#shared/enums/error-codes.enum.js';
import { DtoErrorCodeEnum } from '#shared/enums/dto-error-codes.enum.js';
import {
  IErrorDescriptor,
  IHttpLogContext,
  IStructuredLog,
} from '#shared/types/api.types.js';
import { ErrorResponse } from '#shared/utils/error-response.js';

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

    ErrorResponse.send(
      response,
      request,
      this.logAndMapError(exception, request),
    );
  }

  /** Logs the exception and maps it to { status, code, errors? }. Must not send the response: also called by the oRPC error interceptor. */
  logAndMapError(exception: HttpException, request: Request): IErrorDescriptor {
    const statusCode = exception.getStatus();

    const logContext = this.buildLogContext(exception, request, statusCode);
    this.logStructuredError(logContext);

    const exceptionResponse = exception.getResponse();
    const isValidationError =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray((exceptionResponse as Record<string, unknown>).message);

    if (isValidationError) {
      return {
        status: statusCode,
        code: ErrorCodeEnum.VALIDATION_ERROR,
        errors: (exceptionResponse as Record<string, unknown>)
          .message as string[],
      };
    }

    // 400 without an error code (e.g. malformed JSON body rejected by the body
    // parser): same format as a non-object payload rejected by the contract.
    const isErrorCode = errorCodeSchema.safeParse(exception.message).success;
    if (exception instanceof BadRequestException && !isErrorCode) {
      return {
        status: statusCode,
        code: ErrorCodeEnum.VALIDATION_ERROR,
        errors: [DtoErrorCodeEnum.INPUT_INVALID],
      };
    }

    return {
      status: statusCode,
      code: this.resolveCode(exception, statusCode),
    };
  }

  // =============================================================================
  //                            PRIVATE METHOD
  // =============================================================================

  // Nest / Passport default messages ("Unauthorized", "Cannot GET /x") are not
  // error codes: they are replaced by the contract code matching their status.
  private resolveCode(exception: HttpException, statusCode: number): string {
    const DEFAULT_CODE_BY_STATUS: Partial<Record<number, ErrorCodeEnum>> = {
      [HttpStatus.UNAUTHORIZED]: ErrorCodeEnum.UNAUTHORIZED,
      [HttpStatus.NOT_FOUND]: ErrorCodeEnum.ROUTE_NOT_FOUND,
    };
    const isErrorCode = errorCodeSchema.safeParse(exception.message).success;

    return isErrorCode
      ? exception.message
      : (DEFAULT_CODE_BY_STATUS[statusCode] ?? exception.message);
  }

  private buildLogContext(
    exception: HttpException,
    request: Request,
    statusCode: number,
  ): IHttpLogContext {
    const user: { id?: string; email?: string } | undefined = request.user;

    return {
      method: request.method,
      path: request.url,
      statusCode,
      statusText: HttpStatus[statusCode] || 'UNKNOWN',
      exceptionName: exception.constructor.name,
      message: exception.message,
      userId: user?.id,
      body: this.sanitizeBody(request.body),
      query: Object.keys(request.query).length > 0 ? request.query : undefined,
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
