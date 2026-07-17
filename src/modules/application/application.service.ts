import { Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationRepository } from './application.repository';
import { AddressService } from '../address/address.service';
import { CreateApplicationRequestDto } from './dto/request/create-application.dto';
import { FindAllApplicationRequestDto } from './dto/request/find-all-application.dto';
import { TApplicationDetail } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { AddressOwnerEnum } from '../address/constants';
import {
  Application,
  ApplicationStatus,
  Contact,
  Prisma,
  Skill,
} from '@prisma/client';
import { PaginatedApplicationResponseDto } from './dto/response/paginated-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly addressService: AddressService,
  ) {}

  // ==========================================================================
  //                                 REFACTORED
  //    New code compliant with the Candidature refactor (Lot 1 - CAND-xxx)
  // ==========================================================================

  // --------------------------------- CREATE ---------------------------------

  async create(
    userId: number,
    dto: CreateApplicationRequestDto,
  ): Promise<Application> {
    return await this.applicationRepository.create({ ...dto, userId });
  }

  // ==========================================================================
  //                                   LEGACY
  //    Old code - move above to REFACTORED when reused/adapted, else delete
  // ==========================================================================

  // --------------------------------- DELETE ---------------------------------

  async delete(id: number, userId: number): Promise<void> {
    //Check
    await this.__findOneAndCheckOwnership(id, userId);

    //Address
    await this.addressService.deleteByEntity(AddressOwnerEnum.APPLICATION, id);

    //Application
    await this.applicationRepository.delete(id);
  }

  // ---------------------------------- FIND ----------------------------------

  async findAll(
    userId: number,
    dto: FindAllApplicationRequestDto,
  ): Promise<PaginatedApplicationResponseDto> {
    const cityApplicationIds = dto.city
      ? await this.addressService.findEntityIdsByCity(
          AddressOwnerEnum.APPLICATION,
          dto.city,
        )
      : undefined;

    const limit = dto.limit ?? 10;
    const page = dto.page ?? 1;
    const skip = (page - 1) * limit;

    const { items, total } = await this.applicationRepository.findAllByUserId(
      userId,
      {
        skip,
        take: limit,
        currentStatus: dto.currentStatus,
        company: dto.company,
        createdAt: dto.createdAt,
        appliedAt: dto.appliedAt,
        keyword: dto.keyword,
        cityApplicationIds,
        sortField: dto.sortField as keyof Application | undefined,
        sortDirection: dto.sortDirection,
      },
    );

    const enrichedItems = await Promise.all(
      items.map(async (app) => {
        const address = await this.addressService.findByEntity(
          AddressOwnerEnum.APPLICATION,
          app.id,
        );
        const skills = app.applicationSkills.map((as) => as.skill);
        const { applicationSkills, ...rest } = app;
        return { ...rest, address, skills };
      }),
    );

    return { items: enrichedItems, total, page, limit };
  }

  async findOne(id: number, userId: number): Promise<TApplicationDetail> {
    const application = await this.__findOneAndCheckOwnership(id, userId);

    const address = await this.addressService.findByEntity(
      AddressOwnerEnum.APPLICATION,
      id,
    );

    const skills =
      'applicationSkills' in application && application.applicationSkills
        ? (application.applicationSkills as { skill: Skill }[]).map(
            (as) => as.skill,
          )
        : [];

    const contacts =
      'applicationContacts' in application && application.applicationContacts
        ? (application.applicationContacts as { contact: Contact }[]).map(
            (ac) => ac.contact,
          )
        : [];

    const { applicationSkills, applicationContacts, ...rest } =
      application as Application & {
        applicationSkills?: unknown;
        applicationContacts?: unknown;
      };

    return { ...rest, address, skills, contacts };
  }

  async findRecentByUserId(userId: number, limit: number) {
    const items = await this.applicationRepository.findRecentByUserId(
      userId,
      limit,
    );

    return await Promise.all(
      items.map(async (app) => {
        const address = await this.addressService.findByEntity(
          AddressOwnerEnum.APPLICATION,
          app.id,
        );
        const skills = app.applicationSkills.map((as) => as.skill);
        const { applicationSkills, ...rest } = app;
        return { ...rest, address, skills };
      }),
    );
  }

  // --------------------------------- COUNT ----------------------------------

  async countByStatusForUser(
    userId: number,
  ): Promise<Partial<Record<ApplicationStatus, number>>> {
    return await this.applicationRepository.countByStatusForUser(userId);
  }

  // -------------------------------- PRIVATE ---------------------------------

  private async __findOneAndCheckOwnership(
    id: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOneByIdAndByUserId(
      id,
      userId,
      tx,
    );

    if (!application)
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);

    return application;
  }
}
