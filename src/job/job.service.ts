import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';
import { TechnologyService } from '../technology/technology.service';
import { Job, Prisma } from '@prisma/client';

import { JobHasTechnologyService } from 'src/job-has-technology/job-has-technology.service';
import { PrismaTransactionService } from 'prisma/prisma-transaction.service';
import { UpdateJobInterface } from './interfaces/update-job.interface';


@Injectable()
export class JobService {

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly technologyService: TechnologyService,
    private readonly jhtService: JobHasTechnologyService,
    private readonly prismaTransactionService: PrismaTransactionService,
  ) { }

  //TODO : Revoir les nommages 
  //TODO : Search + auto complete

  async createJobForUser(userId: number, data: CreateJobDto, selectedColumns?: (keyof Job)[]) {

    const { technologies, ...jobData } = data
    return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {

      const technologies = await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id", "name"] });

      const job = await this.jobRepository.createJobForUser({ userId, ...jobData }, { tx, selectedColumns });


      await this.jhtService.createMany(job.id, technologies.map((tech) => tech.id), tx)
      
      return job;

    })
  }

  async updateJobForUser( jobId: number,userId: number, data: UpdateJobDto) {
    const { technologies, ...jobData } = data;
     return await this.prismaTransactionService.execute(async (tx: Prisma.TransactionClient) => {

      const job = await this.jobRepository.updateJobForUser( jobId,userId, jobData , { tx });
      if(data.technologies){
        const technologies = await this.technologyService.findOrCreateMany(data.technologies, { tx, selectedColumns: ["id","name"] });

        await this.jhtService.deleteMany(jobId, tx)
        await this.jhtService.createMany(jobId, technologies.map((tech) => tech.id), tx)
      }

      return job;
       
     
    })


    //récupérer les techno du job existant 
    //comparer pour obtenir celle à supprimer et celle à créer
    //créer et supprimer les technologies

    //vérifier l'adresse

  }


  async findAllForUser(id: number, selectedColumns?: (keyof Job)[]) {
    return await this.jobRepository.findAllForUser(id, selectedColumns);
  }

  async findJobForUser(userId: number, jobId: number, selectedColumns?: (keyof Job)[]) {
    const job = await this.jobRepository.findJobForUser(jobId, userId, selectedColumns);
    if (!job)
      throw new NotFoundException();

    const { jobHasTechnology, ...rest } = job;
    const technologies = jobHasTechnology.map((tech) => { return tech.technology });
    return { ...rest, technologies };
  }

}
