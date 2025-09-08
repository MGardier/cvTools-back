import { Injectable } from '@nestjs/common';
import { JobHasTechnologyRepository } from './job-has-technology.repository';
import { UpsertTechnologyDto } from 'src/technology/dto/upsert-technology.dto';
import { TechnologyService } from 'src/technology/technology.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobHasTechnologyService {

  constructor(private readonly jhtRepository: JobHasTechnologyRepository, private readonly technologyService: TechnologyService) { }

  async findAllByJobId(jobId: number)  {
    return (await this.jhtRepository.findAllByJobId(jobId)).map((jht) => jht.technology);
  }

  async syncJobTechnologies(jobId: number, technologies: UpsertTechnologyDto[],tx ?: Prisma.TransactionClient): Promise<void> {

    const existingTechnology = (await this.jhtRepository.findAllByJobId(jobId,tx)).map((jht) => jht.technology);

    const existingTechnologiesNames = new Set(existingTechnology.map((tech) => tech.name));
    const updatingTechnologiesNames = new Set(technologies.map((tech) => tech.name));


    const technologiesToCreate = technologies.filter((tech) => !existingTechnologiesNames.has(tech.name));
    const technologiesToDelete = existingTechnology.filter((tech) => !updatingTechnologiesNames.has(tech.name));

    await this.technologyService.createMany(technologiesToCreate);
    await this.technologyService.deleteMany(technologiesToDelete);

    return;
  }

}
