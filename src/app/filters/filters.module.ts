import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { PrismaClientExceptionFilter } from './prisma-exception.filter.js';

// Exposes the filters as providers so oRPC routes reuse the same error mapping and logging.
@Module({
  providers: [
    PrismaClientExceptionFilter,
    HttpExceptionFilter,
    GlobalExceptionFilter,
  ],
  exports: [
    PrismaClientExceptionFilter,
    HttpExceptionFilter,
    GlobalExceptionFilter,
  ],
})
export class FiltersModule {}
