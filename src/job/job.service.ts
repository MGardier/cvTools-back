import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './job.repository';

@Injectable()
export class JobService {

  constructor(private readonly jobRepository: JobRepository) { }
  
  async create(data: CreateJobDto) {
    return await this.jobRepository.create(data);
  }

  findAll() {
    return `This action returns all job`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
