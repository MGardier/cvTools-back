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
    return await prisma.jobHasTechnology.findMany({ where: { jobId }, include: { technology: true } })
  }


  async findOrCreateManyByJob(jobId: number, technologies: UpsertTechnologyDto[], tx?: Prisma.TransactionClient) {

    const existingTechnology = (await this.findAllByJobId(jobId,tx)).map((jht) => jht.technology);
    const existingTechnologiesNames = new Set(existingTechnology.map((tech) => tech.name));


    const technologiesToCreate = technologies.filter((tech) => !existingTechnologiesNames.has(tech.name));

    await this.technologyRepository.createMany(technologiesToCreate);

    const newTechnologies = await this.findAllByJobId(jobId);
    return [...existingTechnology, ...newTechnologies];

  }

  //findAllBy


  async createMany(jobId: number, technologiesId: number[]) {

    const data = technologiesId.map((technologyId) => { return { jobId, technologyId } });

    return await this.prismaService.jobHasTechnology.createMany({
      data
    })
  }

  //deleteMany

}