import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import {  Prisma, UserToken } from '@prisma/client';


import { ICreateUserToken } from './types';
import { UtilRepository } from "src/common/utils/util-repository";

@Injectable()
export class UserTokenRepository {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }



  async create(
    data: ICreateUserToken, userId: number,
    selectedColumns?: (keyof UserToken)[],
  ): Promise<Partial<UserToken>> {
    const select: Record<keyof UserToken, boolean> | undefined = UtilRepository.getSelectedColumns<UserToken>(selectedColumns);
    return await this.prismaService.userToken.create({
      select,
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }


  async remove(
    id: number,
    selectedColumns?: (keyof UserToken)[],
  ): Promise<Partial<UserToken>> {
    const select: Record<keyof UserToken, boolean> | undefined = UtilRepository.getSelectedColumns<UserToken>(selectedColumns);
    return await this.prismaService.userToken.delete({
       select,
      where: {
        id,
      },
    });
  }


  async findByUuid(uuid: string, selectedColumns?: (keyof UserToken)[]): Promise<Partial<UserToken> | null> {
    const select: Record<keyof UserToken, boolean> | undefined = UtilRepository.getSelectedColumns<UserToken>(selectedColumns);
    return await this.prismaService.userToken.findUnique({
      select,
      where: {
        uuid,
      },
    });
  }


}

