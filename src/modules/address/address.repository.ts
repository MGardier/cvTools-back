import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { ICreateAddress, IFindByUnique } from './types';

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /********* CREATE *********/

  async create(data: ICreateAddress): Promise<Address> {
    return await this.prismaService.address.create({
      data,
    });
  }

  /********* FIND *********/

  async findByUnique(data: IFindByUnique): Promise<Address | null> {
    return await this.prismaService.address.findUnique({
      where: {
        city_postalCode: {
          city: data.city,
          postalCode: data.postalCode,
        },
      },
    });
  }
}
