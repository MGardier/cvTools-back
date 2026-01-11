import { Injectable } from '@nestjs/common';
import { Prisma, Technology } from '@prisma/client';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { TechnologyRepository } from './technology.repository';
import { IOptionRepository } from 'src/common/types/repository.types';

@Injectable()
export class TechnologyService {

  constructor(private readonly technologyRepository: TechnologyRepository) { }


  async findOrCreateMany(technologies: CreateTechnologyDto[], options?: IOptionRepository<Technology>): Promise<Technology[]> {

    const existingTechnology = await this.technologyRepository.findManyByName(
      technologies.map((tech) => tech.name.toLowerCase()), 
      {...options}
    );

    const existingTechnologiesNames = new Set(existingTechnology.map((tech) => tech.name.toLowerCase()))

    const technologiesToCreate = technologies.filter((tech) => !existingTechnologiesNames.has(tech.name.toLowerCase()));
    await this.technologyRepository.createMany(technologiesToCreate, options?.tx);

    const newTechnologies = await this.technologyRepository.findManyByName(technologiesToCreate.map((tech) => tech.name?.toLowerCase()), { ...options });
    return [...existingTechnology, ...newTechnologies];

  }

  async createMany(technologies: CreateTechnologyDto[],  tx?: Prisma.TransactionClient) {
    return await this.technologyRepository.createMany(technologies,tx);
  }

  async deleteIfNotUseMany(technologiesId : number[], tx?: Prisma.TransactionClient) : Promise<void>{
    const technologiesToDelete = await this.technologyRepository.findUnusedManyById(technologiesId,tx) ;
    await this.technologyRepository.deleteMany(technologiesToDelete.map((tech)=> tech.id));
  }


}
