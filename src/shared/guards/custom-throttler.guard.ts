import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ErrorCodeEnum } from '../enums/error-codes.enum';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new HttpException(
      ErrorCodeEnum.RATE_LIMIT_EXCEEDED,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
