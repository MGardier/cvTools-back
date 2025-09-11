import { Injectable } from '@nestjs/common';
import { Technology } from '@prisma/client';
import { UpsertTechnologyDto } from './dto/upsert-technology.dto';
import { TechnologyRepository } from './technology.repository';
import { OptionRepositoryInterface } from 'src/interfaces/options-repository.interface';

@Injectable()
export class TechnologyService {

  constructor(private readonly technologyRepository: TechnologyRepository) { }


  async findOrCreateMany(technologies: UpsertTechnologyDto[], options?: OptionRepositoryInterface<Technology>): Promise<Technology[]> {

    const existingTechnology = await this.technologyRepository.findManyByName(
      technologies.map((tech) => tech.name.toLowerCase()), 
      {...options}
    );

    const existingTechnologiesNames = new Set(existingTechnology.map((tech) => tech.name.toLowerCase()))
    const technologiesToCreate = technologies.filter((tech) => !existingTechnologiesNames.has(tech.name.toLowerCase()));
    await this.technologyRepository.createMany(technologiesToCreate, options?.tx);

    
    const newTechnologies = await this.technologyRepository.findManyByName(technologiesToCreate.map((tech) => tech.name.toLowerCase()), { ...options });
    return [...existingTechnology, ...newTechnologies];

  }

  async createMany(technologies: UpsertTechnologyDto[]) {
    return await this.technologyRepository.createMany(technologies);
  }



}
