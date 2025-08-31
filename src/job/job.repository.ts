import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { Job, Prisma } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateJobInterface } from "./interfaces/update-job.interface";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async create(
    data: Omit<CreateJobDto, "technologies">,
    technologiesId: number[],
    selectedColumns?: (keyof Job)[],
  ): Promise<Job> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const { userId, address, ...rest } = data;
    const connectTechnologies = technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    }))

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
            where: { city_street_postalCode: address },
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

  async findAllForUser(userId: number, selectedColumns?: (keyof Job)[]) {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findMany({
      select, where: {
        userId
      }
    });
  }


  async findJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]) {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findUnique({
      select, where: {
        id,
        userId
      }
    });
  }


  async deleteAllTechnologies(jobId: number) {
    return await this.prismaService.jobHasTechnology.deleteMany({
      where: {
        jobId,
      }
    })
  }



  async updateJobForUser(id: number, userId: number, data: UpdateJobInterface, selectedColumns?: (keyof Job)[]) {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    const { address, technologiesId, ...rest } = data;
    const connectTechnologies = technologiesId ? technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    })) : null ;

    return await this.prismaService.job.update({
      select,
      data: {
        ...rest,
        ...(address ? {
          address: {
            connectOrCreate: {
              where: { city_street_postalCode: address },
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





}