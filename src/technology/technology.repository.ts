import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UpsertTechnologyDto } from "./dto/upsert-technology.dto";
import { Technology } from "@prisma/client";


@Injectable()
export class TechnologyRepository {
  constructor(private readonly prismaService: PrismaService) { }


  async upsert(data: UpsertTechnologyDto, selectedColumns?: (keyof Technology)[]) {

    return await this.prismaService.technology.upsert({
      where: data,
      create: data,
      update: {}
    })
  }


  async upsertMany(technologies: UpsertTechnologyDto[], selectedColumns?: (keyof Technology)[]) {

    return await Promise.all(
      technologies.map(tech => this.upsert(tech, ['id', 'name'])
      )
    )
  }

}