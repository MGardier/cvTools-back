import { Injectable } from '@nestjs/common';
import { Technology } from '@prisma/client';
import { UpsertTechnologyDto } from './dto/upsert-technology.dto';
import { TechnologyRepository } from './technology.repository';
import { RepositoryOptionsInterface } from 'src/interfaces/repository-options.interface';

@Injectable()
export class TechnologyService {

  constructor(private readonly technologyRepository: TechnologyRepository) { }

  async upsert(data: UpsertTechnologyDto, options?: RepositoryOptionsInterface<Technology>): Promise<Technology> {
    return await this.technologyRepository.upsert(data, options)
  }


  async upsertMany(technologies: UpsertTechnologyDto[], options?: RepositoryOptionsInterface<Technology>): Promise<Technology[]> {
    return await this.technologyRepository.upsertMany(technologies, options)
  }


}
