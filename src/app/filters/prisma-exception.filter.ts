import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { PrismaErrorEnum } from 'src/shared/enums/prisma-error-codes.enum';
import { IPrismaLogContext, IStructuredLog } from 'src/shared/types/api.types';

type LogFormat = 'json' | 'visual' | 'both';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);
  private readonly serviceName = 'cvtools-back';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case PrismaErrorEnum.UniqueConstraintFailed:
        this.handleUniqueConstraintError(exception, request, response);
        break;
      case PrismaErrorEnum.RecordDoesNotExist:
        this.handleRecordDoesNotExist(exception, request, response);
        break;
      default:
        this.handleUnknownPrismaError(exception, request, response, host);
        break;
    }
  }

  private handleUniqueConstraintError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    response: Response,
  ): void {
    const target = exception.meta?.target as string | string[] | undefined;
    const isEmailConstraint = target === 'user_email_key';
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

    response.status(HttpStatus.CONFLICT).json({
      success: false,
      statusCode: HttpStatus.CONFLICT,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private handleRecordDoesNotExist(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    response: Response,
  ): void {
    const message = ErrorCodeEnum.DEFAULT_NOT_FOUND_ERROR;

    const logContext = this.buildLogContext(
      exception,
      request,
      HttpStatus.NOT_FOUND,
      message,
    );
    this.logStructuredError(logContext, 'RECORD_NOT_FOUND');

    response.status(HttpStatus.NOT_FOUND).json({
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private handleUnknownPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    _response: Response,
    host: ArgumentsHost,
  ): void {
    const logContext = this.buildLogContext(
      exception,
      request,
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception.message,
    );
    this.logStructuredError(logContext, 'UNKNOWN_PRISMA_ERROR');

    super.catch(exception, host);
  }

  private buildLogContext(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    statusCode: number,
    message: string,
  ): IPrismaLogContext {
    const user = request.user as { id?: string } | undefined;
    const meta = exception.meta;

    return {
      method: request.method,
      path: request.url,
      statusCode,
      statusText: HttpStatus[statusCode] || 'UNKNOWN',
      message,
      prismaCode: exception.code,
      model: meta?.modelName as string | undefined,
      target: meta?.target as string | string[] | undefined,
      userId: user?.id,
      errorCode: this.mapPrismaCodeToErrorCode(exception.code),
    };
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
