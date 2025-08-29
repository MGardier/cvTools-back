import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { Job } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";

@Injectable()
export class JobRepository {

   constructor(private readonly prismaService: PrismaService) { }

  async create(
    data: Omit<CreateJobDto, 'address'>,
    selectedColumns?: (keyof Job)[],
  ): Promise<Job> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const {userId,technologies,...rest} = data;
    return await this.prismaService.job.create({
      select: select ,
      data: {
        user:{
          connect:{
            id: userId
          }
        },
        technologies: {
          connectOrCreate : {
            ...technologies
          }
        }
      }
    });
  }
}