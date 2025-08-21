import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import {  Prisma, UserToken } from '@prisma/client';


import { CreateUserTokenInterface } from './dto/create-user-token.interface';
import { UtilRepository } from "src/utils/UtilRepository";

@Injectable()
export class UserTokenRepository {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }



  async create(
    data: CreateUserTokenInterface, userId: number,
    selectedColumns?: (keyof UserToken)[],
  ): Promise<Partial<UserToken>> {
    const select: Record<keyof UserToken, boolean> | undefined = UtilRepository.getSelectedColumns<UserToken>(selectedColumns);
    return await this.prismaService.userToken.create({
       ...(select && { select }),
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
       ...(select && { select }),
      where: {
        id,
      },
    });
  }


  async findByUuid(uuid: string, selectedColumns?: (keyof UserToken)[]): Promise<Partial<UserToken> | null> {
    const select: Record<keyof UserToken, boolean> | undefined = UtilRepository.getSelectedColumns<UserToken>(selectedColumns);
    return await this.prismaService.userToken.findUnique({
       ...(select && { select }),
      where: {
        uuid,
      },
    });
  }


}

