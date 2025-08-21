import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from 'express';


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    this.logHttpException(exception, request, statusCode);
    response
      .status(statusCode)
      .json({
        success: false,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,

      });
  }


  private logHttpException(exception: HttpException, request: Request, statusCode: number): void {
    const method = request.method;
    const url = request.url;
    const message = exception.message;
    const exceptionName = exception.constructor.name;
    const timeStamp = new Date().toISOString();
    const stack = exception.stack;


    this.logger.error(`HTTP ${statusCode} Error: ${method} ${url} - (${exceptionName}) - ${timeStamp}`,);
    this.logger.error(`${exceptionName}  : ${message} \nStack: ${stack}`,);

  }
}


