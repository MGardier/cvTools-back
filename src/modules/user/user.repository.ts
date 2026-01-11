import { Injectable } from "@nestjs/common";
import { PrismaService } from 'prisma/prisma.service';
import {  User, UserRoles, UserStatus } from "@prisma/client";

import { UtilRepository } from "src/common/utils/util-repository";
import { IUpdateUser, ICreateUser, IFindOneByOauthId } from "./types";

@Injectable()
export class UserRepository {


  constructor(private readonly prismaService: PrismaService) { }



  async create(
    data: ICreateUser,
    selectedColumns?: (keyof User)[],
  ): Promise<User> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.create({
      select: select ,
      data: {
        ...data,
        roles: UserRoles.USER,
        status: UserStatus.PENDING,
      }
    });
  }


  async update(
    id: number,
    data: IUpdateUser,
    selectedColumns?: (keyof User)[]
  ): Promise<User> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.update({
      select: select ,
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
      select: select ,
    });

  }


  async findOneById(
    id: number,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ,
      where: { id },
    });

  }

  async findOneByEmail(
    email: string,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ,
      where: { email },
    });

  }

    async findOneByOauthId(
    data : IFindOneByOauthId,
    selectedColumns?: (keyof User)[],
  ): Promise<User | null> {
  
    const select: Record<keyof User, boolean> | undefined = UtilRepository.getSelectedColumns<User>(selectedColumns);
    return await this.prismaService.user.findUnique({
      select: select ,
      where: { unique_oauth_user :{
        ...data
      }},
    });

  }



}