import { Injectable } from "@nestjs/common";
import { Prisma, Technology } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { TechnologyRepository } from "src/technology/technology.repository";




@Injectable()
export class JobHasTechnologyRepository {

  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async findAllByJobId(jobId: number, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prismaService;
    return await prisma.jobHasTechnology.findMany({ where: { jobId }, include: { job: true, technology: true } })
  }

  async findAllByTechnologyId(technologyId: number, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prismaService;
    return await prisma.jobHasTechnology.findMany({ where: { technologyId } })
  }


  async createMany(jobId: number, technologiesId: number[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {

    const prisma = tx || this.prismaService;
    const data = technologiesId.map((technologyId) => { return { jobId, technologyId } });

    return await prisma.jobHasTechnology.createMany({
      data
    })
  }

  async deleteMany(jobId: number, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {

    const prisma = tx || this.prismaService;

    return await prisma.jobHasTechnology.deleteMany({
      where: { jobId }
    })
  }

}