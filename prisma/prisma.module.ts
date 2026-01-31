import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionService } from './prisma-transaction.service';

@Global()
@Module({
  providers: [PrismaService,PrismaTransactionService],
  exports: [PrismaService,PrismaTransactionService],
  imports: [],
})
export class PrismaModule {}
