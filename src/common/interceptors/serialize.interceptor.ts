import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import {
  SERIALIZE_KEY,
  SKIP_SERIALIZE_KEY,
  TDtoClass,
} from '../decorators/serialize.decorator';
import { ErrorCodeEnum } from '../enums/error-codes.enum';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SerializeInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipSerialize = this.reflector.getAllAndOverride<boolean>(
      SKIP_SERIALIZE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipSerialize) {
      return next.handle();
    }

    const dto = this.reflector.getAllAndOverride<TDtoClass>(SERIALIZE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!dto) {
      const handler = context.getHandler().name;
      const controller = context.getClass().name;
      this.logger.error(
        `Missing @SerializeWith() or @SkipSerialize() on ${controller}.${handler}`,
      );
      throw new InternalServerErrorException(
        ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      );
    }

    return next.handle().pipe(
      map((data: unknown) => {
        try {
          return plainToInstance(dto, data, {
            excludeExtraneousValues: true,
          });
        } catch (error) {
          this.logger.error(
            `Serialization error: ${(error as Error).message}`,
            (error as Error).stack,
          );
          throw new InternalServerErrorException(
            ErrorCodeEnum.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );
  }
}
