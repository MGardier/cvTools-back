import { Injectable, Logger } from '@nestjs/common';
import { ProviderRepository } from './provider.repository';
import { ICreateProviderLog, IUpdateProviderUsage } from './types';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(private readonly providerRepository: ProviderRepository) {}

  // =============================================================================
  //                                    LOG
  // =============================================================================

  async log(data: ICreateProviderLog): Promise<void> {
    try {
      await this.providerRepository.createLog(data);
    } catch (error) {
      this.logger.error(
        `Failed to log provider call: ${(error as Error).message}`,
      );
    }
  }

  // =============================================================================
  //                               TRACK USAGE
  // =============================================================================

  async trackUsage(data: IUpdateProviderUsage): Promise<void> {
    try {
      await this.providerRepository.upsertUsage(data);
    } catch (error) {
      this.logger.error(`Failed to track usage: ${(error as Error).message}`);
    }
  }
}
