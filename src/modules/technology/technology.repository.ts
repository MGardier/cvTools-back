import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { Prisma, Technology } from "@prisma/client";
import { UtilRepository } from "src/common/utils/util-repository";
import { IOptionRepository } from "src/common/types/repository.types";
import { CreateTechnologyDto } from "./dto/create-technology.dto";


@Injectable()
export class TechnologyRepository {
  constructor(private readonly prismaService: PrismaService) { }




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

  async findMany(options: IOptionRepository<Technology>) {
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);
    const prisma = options?.tx || this.prismaService;
    return await prisma.technology.findMany({
      select,
    })

  }

  async findManyByName(technologiesNames: string[], options: IOptionRepository<Technology>) {
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

  async findManyById(technologiesIds: number[], options: IOptionRepository<Technology>) {
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