import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Job, Prisma } from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateJobInterface } from "./interfaces/update-job.interface";
import { CreateJobInterface } from "./interfaces/create-job.interface";
import { OptionRepositoryInterface } from "src/interfaces/options-repository.interface";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async createJobForUser(
    data: Omit<CreateJobInterface,'technologiesId'>,
   options : OptionRepositoryInterface<Job>
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

  async findAllForUser(userId: number, selectedColumns?: (keyof Job)[]): Promise<Job[]> {
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
    return await this.prismaService.job.findMany({
      select,
       where: {
        userId
      }
    });
  }


  async findJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]): Promise<any | null> {
 const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(selectedColumns);
  return  await this.prismaService.job.findFirst({
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



}