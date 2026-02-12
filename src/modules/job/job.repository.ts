import { Injectable } from '@nestjs/common';
import { Job } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { ICreateJob, IUpdateJob, TJobWithRelations } from './types';

@Injectable()
export class JobRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /********* CREATE *********/

  async create(data: ICreateJob): Promise<TJobWithRelations> {
    return await this.prismaService.job.create({
      data,
      include: {
        address: true,
      },
    });
  }

  /********* UPDATE *********/

  async update(id: number, data: IUpdateJob): Promise<TJobWithRelations> {
    return await this.prismaService.job.update({
      where: { id },
      data,
      include: {
        address: true,
      },
    });
  }

  /********* DELETE *********/

  async delete(id: number): Promise<Job> {
    return await this.prismaService.job.delete({
      where: { id },
    });
  }

  /********* FIND *********/

  async findAll(userId: number): Promise<TJobWithRelations[]> {
    return await this.prismaService.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
      },
    });
  }

  async findOneById(id: number, userId: number): Promise<TJobWithRelations | null> {
    return await this.prismaService.job.findFirst({
      where: { id, userId },
      include: {
        address: true,
      },
    });
  }
}
