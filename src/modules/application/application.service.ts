import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { IApplicationResponse, TRpcResponse } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class ApplicationService implements OnModuleInit {
  constructor(
    @Inject('APPLICATIONS_SERVICE')
    private readonly applicationsClient: ClientProxy,
  ) {}
  private readonly logger = new Logger(ApplicationService.name);

  async onModuleInit() {
    try {
      await this.applicationsClient.connect();
    } catch (error) {
      this.logger.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(userId: number): Promise<IApplicationResponse[]> {
    const RPC_TIMEOUT_MS = 10_000; // 10 seconds
    const FIND_ALL_PATTERN = 'application.find-all';

    let response: TRpcResponse<IApplicationResponse[]>;
    try {
      response = await firstValueFrom(
        this.applicationsClient
          .send<TRpcResponse<IApplicationResponse[]>>(FIND_ALL_PATTERN, {
            userId,
          })
          .pipe(timeout(RPC_TIMEOUT_MS)),
      );
    } catch (error) {
      this.logger.error('application.find-all RPC failed:', error);
      throw new ServiceUnavailableException(
        ErrorCodeEnum.APPLICATIONS_SERVICE_UNAVAILABLE,
      );
    }

    if (!response.success) {
      this.logger.error(
        `application.find-all returned an error: ${response.error.code}`,
      );
      throw new ServiceUnavailableException(
        ErrorCodeEnum.APPLICATIONS_SERVICE_UNAVAILABLE,
      );
    }

    return response.data;
  }
}
