import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '#prisma/generated/client.js';
import type { Request, Response } from 'express';

import { ErrorCodeEnum } from '#src/shared/enums/error-codes.enum.js';
import { PrismaErrorEnum } from '#src/shared/enums/prisma-error-codes.enum.js';
import {
  IErrorDescriptor,
  IPrismaDriverAdapterErrorMeta,
  IPrismaLogContext,
  IStructuredLog,
} from '#src/shared/types/api.types.js';
import { ErrorResponse } from '#src/shared/utils/error-response.js';

type LogFormat = 'json' | 'visual' | 'both';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);
  private readonly serviceName = 'cvtools-back';

  constructor(private readonly configService: ConfigService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    ErrorResponse.send(
      response,
      request,
      this.logAndMapError(exception, request),
    );
  }

  /** Logs the exception and maps it to { status, code, errors? }. Must not send the response: also called by the oRPC error interceptor. */
  logAndMapError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): IErrorDescriptor {
    switch (exception.code) {
      case PrismaErrorEnum.UniqueConstraintFailed:
        return this.handleUniqueConstraintError(exception, request);
      case PrismaErrorEnum.RecordDoesNotExist:
        return this.handleRecordDoesNotExist(exception, request);
      default:
        return this.handleUnknownPrismaError(exception, request);
    }
  }

  // =============================================================================
  //                       PRIVATE METHOD
  // =============================================================================

  private handleUniqueConstraintError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): IErrorDescriptor {
    const target = this.__resolveUniqueTarget(exception);
    const isEmailConstraint =
      target === 'email' ||
      target === 'user_email_key' ||
      (Array.isArray(target) && target.includes('email'));
    const message = isEmailConstraint
      ? ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR
      : ErrorCodeEnum.DEFAULT_ALREADY_EXISTS_ERROR;

    const logContext = this.buildLogContext(
      exception,
      request,
      HttpStatus.CONFLICT,
      message,
    );
    this.logStructuredError(logContext, 'UNIQUE_CONSTRAINT_VIOLATION');

    return { status: HttpStatus.CONFLICT, code: message };
  }

  private handleRecordDoesNotExist(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): IErrorDescriptor {
    const message = ErrorCodeEnum.DEFAULT_NOT_FOUND_ERROR;

    const logContext = this.buildLogContext(
      exception,
      request,
      HttpStatus.NOT_FOUND,
      message,
    );
    this.logStructuredError(logContext, 'RECORD_NOT_FOUND');

    return { status: HttpStatus.NOT_FOUND, code: message };
  }

  private handleUnknownPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): IErrorDescriptor {
    const logContext = this.buildLogContext(
      exception,
      request,
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception.message,
    );
    this.logStructuredError(logContext, 'UNKNOWN_PRISMA_ERROR');

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    };
  }

  private buildLogContext(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    statusCode: number,
    message: string,
  ): IPrismaLogContext {
    const user: { id?: string } | undefined = request.user;
    const meta = exception.meta;

    return {
      method: request.method,
      path: request.url,
      statusCode,
      statusText: HttpStatus[statusCode] || 'UNKNOWN',
      message,
      prismaCode: exception.code,
      model: meta?.modelName as string | undefined,
      target: this.__resolveUniqueTarget(exception),
      userId: user?.id,
      errorCode: this.mapPrismaCodeToErrorCode(exception.code),
    };
  }

  private __resolveUniqueTarget(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string | string[] | undefined {
    const meta = exception.meta;
    if (meta?.target) return meta.target as string | string[];

    const constraint = (
      meta?.driverAdapterError as IPrismaDriverAdapterErrorMeta | undefined
    )?.cause?.constraint;

    return constraint?.fields ?? constraint?.index;
  }

  private mapPrismaCodeToErrorCode(prismaCode: string): string {
    const codeMap: Record<string, string> = {
      [PrismaErrorEnum.UniqueConstraintFailed]: 'UNIQUE_CONSTRAINT_VIOLATION',
      [PrismaErrorEnum.RecordDoesNotExist]: 'RECORD_NOT_FOUND',
    };
    return codeMap[prismaCode] || `PRISMA_${prismaCode}`;
  }

  private buildContextualMessage(context: IPrismaLogContext): string {
    switch (context.prismaCode) {
      case PrismaErrorEnum.UniqueConstraintFailed: {
        const target = Array.isArray(context.target)
          ? context.target.join(', ')
          : context.target;
        return `Unique constraint failed on field(s): ${target || 'unknown'}`;
      }
      case PrismaErrorEnum.RecordDoesNotExist:
        return `Record not found in model: ${context.model || 'unknown'}`;
      default:
        return `Prisma error ${context.prismaCode}: ${context.message}`;
    }
  }

  private logStructuredError(
    context: IPrismaLogContext,
    errorType: string,
  ): void {
    const logFormat =
      this.configService.get<LogFormat>('LOG_FORMAT') || 'visual';
    const timestamp = new Date().toISOString();

    if (logFormat === 'json' || logFormat === 'both') {
      const structuredLog: IStructuredLog = {
        level: 'error',
        timestamp,
        service: this.serviceName,
        exceptionType: 'PrismaClientKnownRequestError',
        context,
      };
      this.logger.error(JSON.stringify(structuredLog));
    }

    if (logFormat === 'visual' || logFormat === 'both') {
      const contextualMessage = this.buildContextualMessage(context);
      const contextLines = this.buildContextLines(context);

      this.logger.error(
        `\n${'═'.repeat(70)}` +
          `\n║ PRISMA EXCEPTION: ${errorType}` +
          `\n${'─'.repeat(70)}` +
          `\n║ Status     : ${context.statusCode} ${context.statusText}` +
          `\n║ Method     : ${context.method}` +
          `\n║ Path       : ${context.path}` +
          `\n║ Prisma Code: ${context.prismaCode}` +
          `\n║ Message    : ${contextualMessage}` +
          contextLines +
          `\n${'─'.repeat(70)}` +
          `\n║ Timestamp  : ${timestamp}` +
          `\n${'═'.repeat(70)}`,
      );
    }
  }

  private buildContextLines(context: IPrismaLogContext): string {
    let lines = '';

    if (context.model) {
      lines += `\n║ Model      : ${context.model}`;
    }
    if (context.target) {
      const targetStr = Array.isArray(context.target)
        ? context.target.join(', ')
        : context.target;
      lines += `\n║ Target     : ${targetStr}`;
    }
    if (context.userId) {
      lines += `\n║ User ID    : ${context.userId}`;
    }

    return lines;
  }
}
