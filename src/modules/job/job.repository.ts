import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Job, Prisma } from "@prisma/client";
import { UtilRepository } from "src/common/utils/util-repository";
import { IUpdateJob, ICreateJob } from "./types";
import { IOptionRepository, IFindAllOptions, IFilterOptions } from "src/common/types/repository.types";
import { id } from "zod/v4/locales/index.cjs";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async createJobForUser(
    data: Omit<ICreateJob, 'technologiesId'>,
    options: IOptionRepository<Job>
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



  async updateJobForUser(jobId: number, userId: number, data: Omit<IUpdateJob, 'userId' | 'technologiesId'>,
    options: IOptionRepository<Job>) {
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

  async findAllJobForUser(userId: number, options: IFilterOptions<Job>): Promise<Job[]> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    const orderBy: Record<keyof Job, Prisma.SortOrder>[] = UtilRepository.getSortedColumns<Job>(options?.sort)

    // Construction dynamique des filtres (évite les objets vides)
    const whereConditions: Prisma.JobWhereInput[] = [];

    if (options?.filters?.jobTitle) {
      whereConditions.push({ jobTitle: { contains: options?.filters?.jobTitle } });
    }

    if (options?.filters?.enterprise) {
      whereConditions.push({ enterprise: { contains: options?.filters?.enterprise } });
    }

    if (options?.filters?.status) {
      whereConditions.push({ status: { equals: options?.filters?.status } });
    }

    if (options?.filters?.applicationMethod) {
      whereConditions.push({ applicationMethod: { equals: options?.filters?.applicationMethod } });
    }


    return await this.prismaService.job.findMany({
      select,
      where: {
        userId,
        ...(whereConditions.length > 0 ? { AND: whereConditions } : {})
      },
      ...(options?.skip ? { skip: options?.skip } : {}),
      ...(options?.limit ? { take: options?.limit } : {}),
      ...(orderBy ? { orderBy } : {})
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