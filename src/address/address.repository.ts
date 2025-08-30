import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { CreateAddressInterface } from "./interfaces/create-adress.interface";

@Injectable()
export class AddressRepository  {
   constructor(private readonly prismaService: PrismaService) { }

}