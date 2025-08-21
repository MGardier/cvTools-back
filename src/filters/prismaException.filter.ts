import { ArgumentsHost, Catch, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import { Request, Response } from 'express';
import { ErrorCodeEnum } from "src/enums/error-codes.enum";
import { PrismaErrorEnum } from "src/enums/prisma-error-codes.enum";
import { LogContextInterface } from 'src/interfaces/log-context.interface';


@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const logContext = this.__buildLogContext(request, exception);

    this.__logPrismaException(logContext);

    switch (exception.code) {
      case PrismaErrorEnum.UniqueConstraintFailed:
        this.handleUniqueConstraintError(exception, request, response)
        break;
      case PrismaErrorEnum.RecordDoesNotExist:
        this.handleRecordDoesNotExist(exception, request, response)
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }

  /***************************************** HANDLE METHOD   ***************************************************************************************/


  private handleUniqueConstraintError(exception: Prisma.PrismaClientKnownRequestError, request: Request, response: Response) : void {
    let message: string;

    if (exception.meta?.target === "user_email_key")
      message = ErrorCodeEnum.EMAIL_ALREADY_EXISTS_ERROR;
    else
      message = ErrorCodeEnum.DEFAULT_ALREADY_EXISTS_ERROR;
    response
      .status(HttpStatus.CONFLICT)
      .json({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,

      });
  }


  private handleRecordDoesNotExist(exception: Prisma.PrismaClientKnownRequestError, request: Request, response: Response) : void {
    response
      .status(HttpStatus.NOT_FOUND)
      .json({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: ErrorCodeEnum.DEFAULT_NOT_FOUND_ERROR,

      });
  }

  /***************************************** LOG METHOD   ***************************************************************************************/


  private __buildLogContext(request: Request, exception: Prisma.PrismaClientKnownRequestError): LogContextInterface {
    return {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
      stack : JSON.stringify(exception.meta, null, 2),
      statusCode: exception.code,
      message: exception.message,
    };
  }

  private __logPrismaException( context: LogContextInterface): void {

    const { method, url, statusCode, message, stack,timestamp} = context;
    this.logger.error(`Prisma Error ${statusCode} : ${method} ${url} - ${timestamp} \n${message} \n${stack}`);

  }

}
