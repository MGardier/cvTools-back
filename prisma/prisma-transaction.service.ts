import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Prisma } from "@prisma/client";


@Injectable()
export class PrismaTransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return await this.prismaService.$transaction(callback);
  }
}