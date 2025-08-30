import { Injectable } from '@nestjs/common';

import { CreateAddressInterface } from './interfaces/create-adress.interface';
import { AddressRepository } from './address.repository';

@Injectable()
export class AddressService {

   constructor(private readonly addressRepository: AddressRepository) { }
  


}
