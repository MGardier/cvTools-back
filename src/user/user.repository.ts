import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, UserRoles, UserStatus } from "@prisma/client";

import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateUserInterface } from "./interfaces/update-user.interface";
import { LoginMethod } from '../../node_modules/.pnpm/@prisma+client@6.10.1_prisma@6.10.1_typescript@5.8.3__typescript@5.8.3/node_modules/.prisma/client/index.d';
import { SignUpInterface } from "./interfaces/sign-up.interface";
import { FindOneByOauthIdInterface } from "./interfaces/find-one-by-oauth-id.interface";

@Injectable()
export class UserRepository {


  constructor(private readonly prismaService: PrismaService) { }

  static readonly DEFAULT_SELECT: Prisma.UserSelect = {
    id: true,
    email: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    roles: true
  };

  async create(
    data: SignUpInterface,
    selectedColumns?: (keyof User)[],
  ): Promise<User> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.create({
      select: select ?? UserRepository.DEFAULT_SELECT,
      data: {
        ...data,
        roles: UserRoles.USER,
        status: UserStatus.PENDING,
      }
    });
  }


  async update(
    id: number,
    data: UpdateUserInterface,
    selectedColumns?: (keyof User)[]
  ): Promise<User> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.update({
      select: select ?? UserRepository.DEFAULT_SELECT,
      where: { id },
      data,
    });

  }

  /***************************************** FIND   ***************************************************************************************/

  async findAll(
    selectedColumns?: (keyof User)[],
  ): Promise<User[]> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findMany({
      select: select ?? UserRepository.DEFAULT_SELECT,
    });

  }


  async findOneById(
    id: number,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ?? UserRepository.DEFAULT_SELECT,
      where: { id },
    });

  }

  async findOneByEmail(
    email: string,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ?? UserRepository.DEFAULT_SELECT,
      where: { email },
    });

  }

    async findOneByOauthId(
    data : FindOneByOauthIdInterface,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ?? UserRepository.DEFAULT_SELECT,
      where: { unique_oauth_user :{
        ...data
      }},
    });

  }



}