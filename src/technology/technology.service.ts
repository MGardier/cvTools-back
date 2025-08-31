import { Injectable } from '@nestjs/common';
import { Technology } from '@prisma/client';
import { UpsertTechnologyDto } from './dto/upsert-technology.dto';
import { TechnologyRepository } from './technology.repository';

@Injectable()
export class TechnologyService {

  constructor(private readonly technologyRepository: TechnologyRepository) { }

  async upsert(data: UpsertTechnologyDto, selectedColumns?: (keyof Technology)[]) {
    return await this.technologyRepository.upsert(data, selectedColumns)
  }


  async upsertMany(technologies: UpsertTechnologyDto[], selectedColumns?: (keyof Technology)[]) {
    return await this.technologyRepository.upsertMany(technologies, selectedColumns)
  }
}
