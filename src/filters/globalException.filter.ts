import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { Request, Response } from 'express';
import { PrismaClientExceptionFilter } from "./prismaException.filter";
import { HttpExceptionFilter } from "./httpException.filter";
import { ErrorCodeEnum } from "src/enums/error-codes.enum";
import { LogContextInterface } from "src/interfaces/log-context.interface";
import { timestamp } from 'rxjs';

//TODO : __pour les privatees 

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

   constructor(
    private readonly prismaFilter: PrismaClientExceptionFilter,
    private readonly httpFilter: HttpExceptionFilter,
  ) {}
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    
    const logContext = this.buildLogContext(request, exception);


    if (exception instanceof PrismaClientKnownRequestError) {
      
      return this.prismaFilter.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      return this.httpFilter.catch(exception, host);
    }
    this.logUnhandledException(logContext);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
        path: request.url,
        timestamp: new Date().toISOString(),

      });

  }


  private buildLogContext(request: Request, exception: unknown): LogContextInterface {
    return {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
      message : exception instanceof Error ? exception.message : 'Unknown error',
      stack : exception instanceof Error   && exception.stack ? exception.stack : "No stack",
    };
  }

  private logUnhandledException( context: LogContextInterface): void {
   const {method,url, timestamp,message, stack} = context;
 
    this.logger.error(`❌ Unhandled Exception: ${method} ${url} - ${timestamp}`);
    this.logger.error(`Error : ${message} \nStack: ${stack}\n`);
  }
  
}