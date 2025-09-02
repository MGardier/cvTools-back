import { Injectable } from '@nestjs/common';
import { Technology } from '@prisma/client';
import { UpsertTechnologyDto } from './dto/upsert-technology.dto';
import { TechnologyRepository } from './technology.repository';
import { OptionRepositoryInterface } from 'src/interfaces/options-repository.interface';

@Injectable()
export class TechnologyService {

  constructor(private readonly technologyRepository: TechnologyRepository) { }


  async findOrCreateMany(technologies: UpsertTechnologyDto[], options ?: OptionRepositoryInterface<Technology>): Promise<Technology[]> {
    return await this.technologyRepository.findOrCreateMany(technologies, options)
  }

  async createMany(technologies: UpsertTechnologyDto[]){
      return  await this.technologyRepository.createMany(technologies);
  }
  
  async deleteMany(technologies: UpsertTechnologyDto[]){
      return  await this.technologyRepository.deleteMany(technologies);
  }

}
