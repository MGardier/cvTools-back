import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserToken } from '@prisma/client';
import { ICreateUserToken } from './types';

@Injectable()
export class UserTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: ICreateUserToken, userId: number): Promise<UserToken> {
    return await this.prismaService.userToken.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async remove(id: number): Promise<UserToken> {
    return await this.prismaService.userToken.delete({
      where: {
        id,
      },
    });
  }

  async findByUuid(uuid: string): Promise<UserToken | null> {
    return await this.prismaService.userToken.findUnique({
      where: {
        uuid,
      },
    });
  }
}
