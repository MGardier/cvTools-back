import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User, UserRoles, UserStatus } from '@prisma/client';
import { IUpdateUser, ICreateUser, IFindOneByOauthId } from './types';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: ICreateUser): Promise<User> {
    return await this.prismaService.user.create({
      data: {
        ...data,
        roles: UserRoles.USER,
        status: data.status ?? UserStatus.PENDING,
      },
    });
  }

  async update(id: number, data: IUpdateUser): Promise<User> {
    return await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  /***************************************** FIND   ***************************************************************************************/

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findOneByOauthId(data: IFindOneByOauthId): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        unique_oauth_user: {
          ...data,
        },
      },
    });
  }
}
