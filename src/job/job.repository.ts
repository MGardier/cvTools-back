import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Job, Prisma } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateJobInterface } from "./interfaces/update-job.interface";
import { CreateJobInterface } from "./interfaces/create-job.interface";
import { OptionRepository } from "src/interfaces/options-repository.interface";
import { id } from "zod/v4/locales/index.cjs";
import { FindAllOptions } from "src/interfaces/findAll-options.interface";
import { FilterOptions } from "src/interfaces/filter-options.interface";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async createJobForUser(
    data: Omit<CreateJobInterface, 'technologiesId'>,
    options: OptionRepository<Job>
  ): Promise<Job> {
    const prisma = options?.tx || this.prismaService;
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    const { userId, address, ...rest } = data;

    return await prisma.job.create({
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

      }
    });
  }



  async updateJobForUser(jobId: number, userId: number, data: Omit<UpdateJobInterface, 'userId' | 'technologiesId'>,
    options: OptionRepository<Job>) {
    const prisma = options?.tx || this.prismaService;
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    const { address, ...jobData } = data;
    return await prisma.job.update({
      select: select,
      data: {
        ...jobData,
        ...(address && {
          address: {
            connectOrCreate: {
              where: { city_postalCode: address },
              create: address
            }
          }
        }),


      },
      where: {
        id: jobId,
        user: { is: { id: userId } }
      }
    });

  }

  async findAllJobForUser(userId: number, options: FilterOptions<Job>): Promise<Job[]> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    return await this.prismaService.job.findMany({
      select,
      where: {
        userId
      },
      ...(options?.skip ? { skip: options?.skip } : {}),
      ...(options?.limit ? { take: options?.limit } : {})
    });
  }


  async findOneJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]): Promise<any | null> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findFirst({
      select: {
        ...select,
        address: true,
        jobHasTechnology: {
          select: {
            technology: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      where: { id, userId },
    });
  }

  async countJobsForUser(userId: number) {
    return await this.prismaService.job.count({
      where: {
        userId
      }
    })
  }


}