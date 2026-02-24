import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderRepository } from './provider.repository';

@Module({
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService],
})
export class ProviderModule {}
