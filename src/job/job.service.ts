import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job, Prisma } from '@prisma/client';

import { JobHasTechnologyService } from 'src/job-has-technology/job-has-technology.service';
import { PrismaTransactionService } from 'prisma/prisma-transaction.service';
import { UpdateJobInterface } from './interfaces/update-job.interface';
import { ErrorCodeEnum } from 'src/enums/error-codes.enum';
import { FindAllOptions } from 'src/interfaces/findAll-options.interface';
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

  //TODO : Revoir les nommages 
  //TODO : Search + auto complete

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

  //search, sort + pagination

  async findAllJobForUser(userId: number, options: FindAllOptions<Job>) {


    let count :number |undefined  = await this.cacheManager.get(`job:countJobsForUser:${userId}`);
    if (!count) {
      count = await this.jobRepository.countJobsForUser(userId);
      await this.cacheManager.set(`user:${userId}:countJobsForUser`, count, 28800)
    }


    const { page,limit, ...restOptions } = options;
    const defineLimit = limit || 10
    const data =  await this.jobRepository.findAllJobForUser(userId, {
      ...restOptions,
      limit : defineLimit,
      skip: page ? (page - 1) * defineLimit : 0,
    });
    return {data,limit ,count, page , maxPage : Math.ceil(count/ defineLimit)}
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
