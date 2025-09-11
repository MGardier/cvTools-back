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

  //TODO : Revoir les nommages 
  //TODO : Search + auto complete

  async createJobForUser(userId: number, data: CreateJobDto, selectedColumns?: (keyof Job)[]) {

    const { technologies, ...rest } = data
    return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {


      const technologies = await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id", "name"] });

      const job = await this.jobRepository.createJobForUser({ userId, ...rest }, { tx, selectedColumns });

      await this.JhTService.createMany(job.id, technologies.map((tech) => tech.id), tx)

    })
  }

  async findAllForUser(id: number, selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.findAllForUser(id, selectedColumns);
  }

  async findJobForUser(jobId: number, userId: number, selectedColumns?: (keyof Job)[]) {
    const job = await this.jobRepository.findJobForUser(jobId, userId);
    if (!job)
      throw new NotFoundException();
    return job;
  }

}
