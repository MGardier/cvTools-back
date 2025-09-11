import { Injectable } from "@nestjs/common";
import { Prisma, Technology } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { OptionRepositoryInterface } from "src/interfaces/options-repository.interface";
import { UpsertTechnologyDto } from "src/technology/dto/upsert-technology.dto";
import { TechnologyRepository } from "src/technology/technology.repository";
import { UtilRepository } from "src/utils/UtilRepository";



@Injectable()
export class JobHasTechnologyRepository {

  constructor(
    private readonly prismaService: PrismaService,
    private readonly technologyRepository: TechnologyRepository
  ) { }

  async findAllByJobId(jobId: number,tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prismaService;
    return await prisma.jobHasTechnology.findMany({ where: { jobId }, include: {job:true, technology: true } })
  }


  async createMany(jobId: number, technologiesId: number[],tx?: Prisma.TransactionClient) :Promise<Prisma.BatchPayload> {

    const prisma = tx || this.prismaService;
    const data = technologiesId.map((technologyId) => { return { jobId, technologyId } });

    return await prisma.jobHasTechnology.createMany({
      data
    })
  }

  //deleteMany

}