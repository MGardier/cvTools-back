import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UpsertTechnologyDto } from "./dto/upsert-technology.dto";
import { Prisma, Technology } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { OptionRepositoryInterface } from "src/interfaces/options-repository.interface";
import { FindManyTechnologyInterface } from "./interfaces/find-many-technology.interface";


@Injectable()
export class TechnologyRepository {
  constructor(private readonly prismaService: PrismaService) { }


//TODO: Typage
//Todo : case sensitive lowercase
//TODO : Faire par fonctionnazlité pback puis front
//TODO : Voir la pertinence renvoie de données

  async findOrCreateMany(technologies: UpsertTechnologyDto[], options?: OptionRepositoryInterface<Technology>): Promise<Technology[]> {

    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    const existingTechnology = await prisma.technology.findMany({
      select, where: {
        name: {
          in: technologies.map((tech) => tech.name)
        }
      }
    });

    const existingTechnologiesNames = new Set(existingTechnology.map((tech) => tech.name))
    const technologiesToCreate = technologies.filter((tech) => !existingTechnologiesNames.has(tech.name));

    await this.createMany(technologiesToCreate, options?.tx);

    const newTechnologies = await this.findMany({
      tx :options?.tx,
      technologiesName: technologiesToCreate.map((tech) => tech.name)
    });
    return [...existingTechnology, ...newTechnologies];

  }

  //filter
  async findMany(options?: FindManyTechnologyInterface) {
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    return await prisma.technology.findMany({
      select, where: {
        id: {
          in: options?.technologiesId || []
        },
        name: {
          in: options?.technologiesName || []
        }
      }
    })

  }

  async createMany(technologies: UpsertTechnologyDto[], tx?: Prisma.TransactionClient) {
    return await prisma.technology.createMany({
      data: technologies
    });
  }

  async deleteManyById(technologyIds: number[]) {
    return await this.prismaService.technology.deleteMany({
      where: {
        id: {
          in : technologyIds
        }
      }
    })
  }

  
}