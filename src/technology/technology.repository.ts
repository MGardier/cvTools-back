import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { Prisma, Technology } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { OptionRepository } from "src/interfaces/options-repository.interface";
import { CreateTechnologyDto } from "./dto/create-technology.dto";


@Injectable()
export class TechnologyRepository {
  constructor(private readonly prismaService: PrismaService) { }


  //TODO: Typage
  //Todo : case sensitive lowercase
  //TODO : Faire par fonctionnazlité pback puis front
  //TODO : Voir la pertinence renvoie de données




  async createMany(technologies: CreateTechnologyDto[], tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prismaService;
    return await prisma.technology.createMany({
      data: technologies
    });
  }


  async deleteMany(technologiesId: number[], tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prismaService;
    const data = technologiesId.map((technologyId) => { return { id :technologyId } });
    return await prisma.technology.deleteMany({
      where: {OR :data}
    });
  }

  async findMany(options: OptionRepository<Technology>) {
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    return await prisma.technology.findMany({
      select,
    })

  }

  async findManyByName(technologiesNames: string[], options: OptionRepository<Technology>) {
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    return await prisma.technology.findMany({
      select, where: {
        name: {
          in: technologiesNames || []
        }
      }
    })
  }

  async findManyById(technologiesIds: number[], options: OptionRepository<Technology>) {
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    return await prisma.technology.findMany({
      select, where: {
        id: {
          in: technologiesIds || []
        }
      }
    })
  }


  async findUnusedManyById(technologiesIds: number[], tx?: Prisma.TransactionClient) {

    const prisma = tx || this.prismaService;
    return await prisma.technology.findMany({
      where: {
        id: { in: technologiesIds },
        jobHasTechnology: {
          none: {}
        }
      },
      select: {
        id: true,
      }
    });
  }





}