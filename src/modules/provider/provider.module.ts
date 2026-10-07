import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service.js';
import { ProviderRepository } from './provider.repository.js';

@Module({
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService],
})
export class ProviderModule {}
