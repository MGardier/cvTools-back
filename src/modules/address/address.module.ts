import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';

@Module({
  exports: [AddressService],
  providers: [AddressService, AddressRepository],
})
export class AddressModule {}
