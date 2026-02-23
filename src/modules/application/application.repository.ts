import { Injectable } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { CreateApplicationRequestDto } from './dto/request/create-application.dto';
import { UpdateApplicationRequestDto } from './dto/request/update-application.dto';
import {
  mapApplicationDtoToCreateData,
  mapApplicationDtoToUpdateData,
} from 'src/shared/utils/util-repository';

@Injectable()
export class ApplicationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    dto: CreateApplicationRequestDto,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const client = tx ?? this.prismaService;
    const data = mapApplicationDtoToCreateData(dto, userId);

    return await client.application.create({ data });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    dto: UpdateApplicationRequestDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const client = tx ?? this.prismaService;
    const data = mapApplicationDtoToUpdateData(dto);

    return await client.application.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number): Promise<Application> {
    return await this.prismaService.application.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(userId: number): Promise<Application[]> {
    return await this.prismaService.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: number, userId: number): Promise<Application | null> {
    return await this.prismaService.application.findFirst({
      where: { id, userId },
    });
  }
}
