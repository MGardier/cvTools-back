import { Injectable } from '@nestjs/common';
import { ProviderLogger, ProviderUsageRecord } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { ICreateProviderLog, IUpdateProviderUsage } from './types';

@Injectable()
export class ProviderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               PROVIDER LOGGER
  // =============================================================================

  async createLog(data: ICreateProviderLog): Promise<ProviderLogger> {
    return await this.prismaService.providerLogger.create({ data });
  }

  // =============================================================================
  //                            PROVIDER USAGE RECORD
  // =============================================================================

  async upsertUsage(data: IUpdateProviderUsage): Promise<ProviderUsageRecord> {
    const periodStartAt = this.__getPeriodStart();

    return await this.prismaService.providerUsageRecord.upsert({
      where: {
        userId_provider_periodStartAt: {
          userId: data.userId,
          provider: data.provider,
          periodStartAt,
        },
      },
      create: {
        userId: data.userId,
        provider: data.provider,
        periodStartAt,
        requestCount: 1,
        tokensConsumed: data.tokensConsumed,
      },
      update: {
        requestCount: { increment: 1 },
        tokensConsumed: { increment: data.tokensConsumed },
      },
    });
  }

  /********* PRIVATE *********/

  private __getPeriodStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
