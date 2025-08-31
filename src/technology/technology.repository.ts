import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UpsertTechnologyDto } from "./dto/upsert-technology.dto";
import { Technology } from "@prisma/client";
import { RepositoryOptionsInterface } from "src/interfaces/repository-options.interface";
import { UtilRepository } from "src/utils/UtilRepository";


@Injectable()
export class TechnologyRepository {
  constructor(private readonly prismaService: PrismaService) { }


  async upsert(data: UpsertTechnologyDto, options?: RepositoryOptionsInterface<Technology>): Promise<Technology> {
    const prisma = options?.tx || this.prismaService;
    const select: Record<keyof Technology, boolean> | undefined = UtilRepository.getSelectedColumns<Technology>(options?.selectedColumns);

    return await prisma.technology.upsert({
      select,
      where: data,
      create: data,
      update: {}
    });
  }


  async upsertMany(technologies: UpsertTechnologyDto[], options?: RepositoryOptionsInterface<Technology>): Promise<Technology[]> {
    return await Promise.all(technologies.map(tech => this.upsert(tech, options)));
  }

}