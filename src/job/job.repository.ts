import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { Job, Prisma } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";

@Injectable()
export class JobRepository {

   constructor(private readonly prismaService: PrismaService) { }

  async create(
    data: Omit<CreateJobDto, 'address'>,
    selectedColumns?: (keyof Job)[],
  ): Promise<Job> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const {userId,address, technologies,...rest} = data;
    const connectOrCreateTechnologies = technologies.map((tech)=> {
      return { where : tech,
        create: tech
      }
    
    });

    return await this.prismaService.job.create({
      select: select ,
      data: {
        ...rest,
        user:{
          connect:{
            id: userId
          }
        },
        address 
        technologies: {
          connectOrCreate : 
          connectOrCreateTechnologies
          
        }
      }
    });
  }
}