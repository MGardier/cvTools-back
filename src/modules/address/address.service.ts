import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';

import { AddressRepository } from './address.repository';
import { ICreateAddress } from './types';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  /********* FIND OR CREATE *********/

  async findOrCreate(data: ICreateAddress): Promise<Address> {
    const normalizedCity = data.city.toLowerCase().trim();
    const normalizedPostalCode = data.postalCode.trim();

    const existing = await this.addressRepository.findByUnique({
      city: normalizedCity,
      postalCode: normalizedPostalCode,
    });

    if (existing) {
      return existing;
    }

    return await this.addressRepository.create({
      city: normalizedCity,
      postalCode: normalizedPostalCode,
    });
  }
}
