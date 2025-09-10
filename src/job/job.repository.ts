import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Job, Prisma} from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateJobInterface } from "./interfaces/update-job.interface";
import { CreateJobInterface } from "./interfaces/create-job.interface";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async createJobForUser(
    data: CreateJobInterface,
    selectedColumns?: (keyof Job)[]
  ): Promise<Job> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const { userId,technologiesId,address, ...rest } = data;
    const connectTechnologies = technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    }));

    return await this.prismaService.job.create({
      select: select,
      data: {
        ...rest,
        user: {
          connect: {
            id: userId
          }
        },
        address: {
          connectOrCreate: {
            where: { city_postalCode: address },
            create: address
          }
        },
        jobHasTechnology:
        {
          create: connectTechnologies,
        }

      }
    });
  }

  async findAllForUser(userId: number, selectedColumns?: (keyof Job)[]) :Promise<Job[]> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findMany({
      select, where: {
        userId
      }
    });
  }


  async findJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]):Promise<Job | null> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findFirst({
      select, where: {
        id,
        userId
      }
    });
  }


  async deleteAllTechnologies(jobId: number): Promise<Prisma.BatchPayload> {
   
    return await this.prismaService.jobHasTechnology.deleteMany({
      where: {
        jobId,
      }
    })
  }



  async updateJobForUser( data: UpdateJobInterface,  selectedColumns?: (keyof Job)[]): Promise<Job> {

    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const { id, userId, address, technologiesId, ...rest } = data;
    const connectTechnologies = technologiesId ? technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    })) : undefined ;

    return await this.prismaService.job.update({
      select,
      data: {
        ...rest,
        ...(address ? {
          address: {
            connectOrCreate: {
              where: { city_postalCode: address },
              create: address
            }
          },
        } : {}),
        ...(connectTechnologies ? {
          jobHasTechnology: {

            create: connectTechnologies,

          },
        } : {}),

      },
      where: {
        id,
        userId
      },
    });
  }

  async delete(id: number,userId: number,selectedColumns?: (keyof Job)[]): Promise<Job>{
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.delete({
      select,
      where: {
        id,
        userId
      }
    })
  }



}