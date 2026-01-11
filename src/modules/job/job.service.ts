import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job, Prisma } from '@prisma/client';

import { JobHasTechnologyService } from 'src/modules/job-has-technology/job-has-technology.service';
import { PrismaTransactionService } from 'prisma/prisma-transaction.service';
import { ErrorCodeEnum } from 'src/common/enums/error-codes.enum';
import { IFindAllOptions } from 'src/common/types/repository.types';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';


@Injectable()
export class JobService {

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly technologyService: TechnologyService,
    private readonly jhtService: JobHasTechnologyService,
    private readonly prismaTransactionService: PrismaTransactionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }



  async createJobForUser(userId: number, data: CreateJobDto, selectedColumns?: (keyof Job)[]): Promise<Job> {

    const { technologies, ...jobData } = data
    return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {

      const technologies = await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id", "name"] });

      const job = await this.jobRepository.createJobForUser({ userId, ...jobData }, { tx, selectedColumns });


      await this.jhtService.createMany(job.id, technologies.map((tech) => tech.id), tx)

      return job;

    })
  }

  async updateJobForUser(jobId: number, userId: number, data: UpdateJobDto): Promise<Job> {
    const { technologies, ...jobData } = data;
    return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {

      const job = await this.jobRepository.updateJobForUser(jobId, userId, jobData, { tx });
      if (!job)
        throw new NotFoundException(ErrorCodeEnum.JOB_NOT_FOUND_ERROR);

      if (data.technologies) {
        const technologies = await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id", "name"] });

        await this.jhtService.deleteMany(jobId, tx)
        await this.jhtService.createMany(jobId, technologies.map((tech) => tech.id), tx)
      }

      return job;
    })
  }


  async findAllJobForUser(userId: number, options: IFindAllOptions<Job>) {

    const cacheKey = `user:${userId}:countJobsForUser`;
    let count: number | undefined = await this.cacheManager.get(cacheKey);
    if (!count) {
      count = await this.jobRepository.countJobsForUser(userId);
      //hour * min * sec
      await this.cacheManager.set(cacheKey, count, 8 * 60 * 60)
    }


    const { page, limit, sort, ...restOptions } = options;
    const defineLimit = limit || 10

    let skip = 0;
    if (page && page > 0) {
      skip = (page - 1) * defineLimit;

      if (skip >= count) {
        const maxPage = Math.ceil(count / defineLimit);
        skip = Math.max(0, (maxPage - 1) * defineLimit);
      }
    }


    const data = await this.jobRepository.findAllJobForUser(userId, {
      ...restOptions,
      limit: defineLimit,
      skip,
      sort: sort
    });
    return { data, limit, count, page, maxPage: Math.ceil(count / defineLimit) }
  }

  async findOneJobForUser(userId: number, jobId: number, selectedColumns?: (keyof Job)[]) {
    const job = await this.jobRepository.findOneJobForUser(jobId, userId, selectedColumns);
    if (!job)
      throw new NotFoundException();

    const { jobHasTechnology, ...rest } = job;
    const technologies = jobHasTechnology.map((tech) => { return tech.technology });
    return { ...rest, technologies };
  }

}
