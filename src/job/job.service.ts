import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job, Prisma } from '@prisma/client';

import { JobHasTechnologyService } from 'src/job-has-technology/job-has-technology.service';
import { PrismaTransactionService } from 'prisma/prisma-transaction.service';


@Injectable()
export class JobService {

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly technologyService: TechnologyService,
    private readonly JhTService: JobHasTechnologyService,
    private readonly prismaTransactionService: PrismaTransactionService,
  ) { }


  async createJobForUser(userId: number, data: CreateJobDto, selectedColumns?: (keyof Job)[]) {

    const { technologies, ...rest } = data
    return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {

      const technologiesId = (await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id", "name"] })).map((tech) => tech.id)
      return await this.jobRepository.createJobForUser({ userId, technologiesId, ...rest }, selectedColumns);

    })
  }

  async findAllForUser(id: number, selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.findAllForUser(id, selectedColumns);
  }

  async findJobForUser(jobId: number, userId: number, selectedColumns?: (keyof Job)[]) {
    const job = await this.jobRepository.findJobForUser(jobId, userId, selectedColumns);
    if (!job)
      throw new NotFoundException();
    return job;
  }

  async updateJobForUser(userId: number, id: number, data: UpdateJobDto, selectedColumns?: (keyof Job)[]) {
    const { technologies, ...rest } = data


    const existingTechnologies = (await this.JhTService.findAllByJobId(id));

    //celle à créer

    //celle à supprimer



    return;

    // await this.jobRepository.deleteAllTechnologies(id);
    // let technologiesId: number[] | undefined;
    // if (technologies)
    //   technologiesId = (await this.technologyService.findOrCreateMany(technologies,)).map((tech) => tech.id)

    // return await this.jobRepository.updateJobForUser({ id, userId, technologiesId, ...rest }, selectedColumns )


  }

  async deleteJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.delete(id, userId, selectedColumns);
  }
}
