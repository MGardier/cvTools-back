import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class JobService {

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly technologyService: TechnologyService, 
    private readonly prismaService: PrismaService
  ) { }

  async createJobForUser(userId: number, data: CreateJobDto, selectedColumns?: (keyof Job)[]) {
    const { technologies, ...rest } = data
    return await this.prismaService.$transaction(async (tx) => {
      const technologiesId = (await this.technologyService.upsertMany(data.technologies,{tx})).map((tech) => tech.id)

      return await this.jobRepository.createJobForUser({userId, technologiesId,... rest},{selectedColumns});
    });
       
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

  async updateJobForUser(id: number, userId: number, data: UpdateJobDto, selectedColumns?: (keyof Job)[]) {
    const { technologies, ...rest } = data
    return await this.prismaService.$transaction(async (tx) => {

      await this.jobRepository.deleteAllTechnologies(id, tx);
      let technologiesId: number[] | undefined;
      if (technologies)
        technologiesId = (await this.technologyService.upsertMany(technologies, { tx })).map((tech) => tech.id)

      return await this.jobRepository.updateJobForUser({ id, userId, technologiesId, ...rest }, { tx, selectedColumns })
    })

  }

  async deleteJobForUser(id: number, userId: number, selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.delete(id, userId,selectedColumns);
  }
}
