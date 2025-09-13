import { Injectable } from '@nestjs/common';
import { JobHasTechnologyRepository } from './job-has-technology.repository';
import { TechnologyService } from 'src/technology/technology.service';
import { Prisma, Technology } from '@prisma/client';

@Injectable()
export class JobHasTechnologyService {

  constructor(private readonly jhtRepository: JobHasTechnologyRepository, private readonly technologyService: TechnologyService) { }

  async findAllByJobId(jobId: number)  {
    return (await this.jhtRepository.findAllByJobId(jobId)).map((jht) => jht.technology);
  }

  async createMany(jobId: number, technologiesId: number[],tx?: Prisma.TransactionClient ):Promise<Prisma.BatchPayload>  {

    return await this.jhtRepository.createMany(jobId,technologiesId,tx);
  }

}
