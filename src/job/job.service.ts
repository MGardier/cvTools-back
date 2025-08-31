import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job } from '@prisma/client';

@Injectable()
export class JobService {

  constructor(private readonly jobRepository: JobRepository, private readonly technologyService: TechnologyService) { }
  
  async create(data: CreateJobDto,selectedColumns?: (keyof Job)[]) {
    const {technologies, ...rest} = data
    const technologiesId = (await this.technologyService.upsertMany(data.technologies)).map((tech)=> tech.id)
    
    return await this.jobRepository.create(rest,technologiesId);
  }

 async findAllForUser(id: number,selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.findAllForUser(id,selectedColumns);
  }

  async findJobForUser(jobId: number, userId: number,selectedColumns?: (keyof Job)[]) {
    const job =  await this.jobRepository.findJobForUser(jobId,userId,selectedColumns);
    if(!job)
      throw new NotFoundException();
    return job;
  }

  async updateJobForUser(jobId: number,userId: number, data: UpdateJobDto) {
    const {technologies, ...rest} = data
    let job : Job | undefined ; 
    if(technologies)
    {
      await this.jobRepository.deleteAllTechnologies(jobId);
      const technologiesId = (await this.technologyService.upsertMany(technologies)).map((tech)=> tech.id)
      job = await this.jobRepository.updateJobForUser(jobId,userId,{...rest,technologiesId})

    } 
    else  
       job = await this.jobRepository.updateJobForUser(jobId,userId,rest)

    
   

    
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
