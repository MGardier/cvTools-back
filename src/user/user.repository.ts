import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import {  User, UserRoles, UserStatus } from "@prisma/client";

import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateUserInterface } from "./interfaces/update-user.interface";
import { CreateUserInterface } from "./interfaces/create-user.interface";
import { FindOneByOauthIdInterface } from "./interfaces/find-one-by-oauth-id.interface";

@Injectable()
export class UserRepository {


  constructor(private readonly prismaService: PrismaService) { }



  async create(
    data: CreateUserInterface,
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
    data: UpdateUserInterface,
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
    data : FindOneByOauthIdInterface,
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