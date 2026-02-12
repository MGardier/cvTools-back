import { Injectable, NotFoundException } from '@nestjs/common';

import { JobRepository } from './job.repository';
import { AddressService } from '../address/address.service';
import { CreateJobRequestDto } from './dto/request/create-job.dto';
import { UpdateJobRequestDto } from './dto/request/update-job.dto';
import { TJobWithRelations } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly addressService: AddressService,
  ) {}

  /********* CREATE *********/

  async create(userId: number, dto: CreateJobRequestDto): Promise<TJobWithRelations> {


    const address  = dto.address ? await this.addressService.findOrCreate(dto.address) : null;

    return await this.jobRepository.create({
      title: dto.title,
      url: dto.url,
      origin: dto.origin,
      publishedAt: new Date(dto.publishedAt),
      userId,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      company: dto.company,
      apiOfferId: dto.apiOfferId,
      description: dto.description,
      status: dto.status,
      apiProvider: dto.apiProvider,
      contractType: dto.contractType,
      experience: dto.experience,
      remotePolicy: dto.remotePolicy,
      compatibility: dto.compatibility,
          ...(address  && { addressId : address.id }),
    });
  }

  /********* UPDATE *********/

  async update(
    id: number,
    userId: number,
    dto: UpdateJobRequestDto,
  ): Promise<TJobWithRelations> {
    const existingJob = await this.jobRepository.findOneById(id, userId);
    if (!existingJob) {
      throw new NotFoundException(ErrorCodeEnum.JOB_NOT_FOUND_ERROR);
    }
    

    const address  = dto.address ? await this.addressService.findOrCreate(dto.address) : null;

    return await this.jobRepository.update(id, {
      title: dto.title,
      url: dto.url,
      origin: dto.origin,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      company: dto.company,
      apiOfferId: dto.apiOfferId,
      description: dto.description,
      rejectedReason: dto.rejectedReason,
      status: dto.status,
      apiProvider: dto.apiProvider,
      contractType: dto.contractType,
      experience: dto.experience,
      remotePolicy: dto.remotePolicy,
      compatibility: dto.compatibility,
      ...(dto.appliedAt  && { appliedAt : new Date(dto.appliedAt) }),
      ...(address  && { addressId : address.id }),
    });
  }

  /********* DELETE *********/

  async delete(id: number, userId: number): Promise<void> {
    const existingJob = await this.jobRepository.findOneById(id, userId);
    if (!existingJob) {
      throw new NotFoundException(ErrorCodeEnum.JOB_NOT_FOUND_ERROR);
    }

    await this.jobRepository.delete(id);
  }

  /********* FIND *********/

  async findAll(userId: number): Promise<TJobWithRelations[]> {
    return await this.jobRepository.findAll(userId);
  }

  async findOne(id: number, userId: number): Promise<TJobWithRelations> {
    const job = await this.jobRepository.findOneById(id, userId);
    if (!job) {
      throw new NotFoundException(ErrorCodeEnum.JOB_NOT_FOUND_ERROR);
    }
    return job;
  }
}
