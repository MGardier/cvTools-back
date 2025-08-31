import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Job, Prisma} from "@prisma/client";
import { UtilRepository } from "src/utils/UtilRepository";
import { UpdateJobInterface } from "./interfaces/update-job.interface";
import { RepositoryOptionsInterface } from "../interfaces/repository-options.interface";
import { PrismaTransactionClientType } from "src/types/prisma-transaction-client.type";
import { CreateJobInterface } from "./interfaces/create-job.interface";

@Injectable()
export class JobRepository {

  constructor(private readonly prismaService: PrismaService) { }

  async createJobForUser(
    data: CreateJobInterface,
    options?: RepositoryOptionsInterface<Job>
  ): Promise<Job> {
    const prisma = options?.tx || this.prismaService;
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    const { userId,technologiesId,address, ...rest } = data;
    const connectTechnologies = technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    }));

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


  async deleteAllTechnologies(jobId: number, tx?:  PrismaTransactionClientType): Promise<Prisma.BatchPayload> {
    const prisma = tx || this.prismaService;
    return await prisma.jobHasTechnology.deleteMany({
      where: {
        jobId,
      }
    })
  }



  async updateJobForUser( data: UpdateJobInterface, options?: RepositoryOptionsInterface<Job>): Promise<Job> {
    const prisma = options?.tx || this.prismaService;
    const select: Record<keyof Job, boolean> | undefined = UtilRepository.getSelectedColumns<Job>(options?.selectedColumns);
    const { id, userId, address, technologiesId, ...rest } = data;
    const connectTechnologies = technologiesId ? technologiesId.map((id) => ({
      technology: {
        connect: { id }
      }
    })) : undefined ;

    return await prisma.job.update({
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