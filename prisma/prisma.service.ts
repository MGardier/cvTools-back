import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
    const showLog = process.env.SHOW_SQL === 'true';
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      log: showLog ?
      [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ] : [],
    })
  }

  async onModuleInit() {
    await this.$connect();
  }
}
