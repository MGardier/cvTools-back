import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { ApplicationRepository } from './application.repository';
import { AddressService } from '../address/address.service';
import { SkillService } from '../skill/skill.service';
import { ContactService } from '../contact/contact.service';
import { CreateApplicationRequestDto } from './dto/request/create-application.dto';
import { UpdateApplicationRequestDto } from './dto/request/update-application.dto';
import { FindAllApplicationRequestDto } from './dto/request/find-all-application.dto';
import { TApplicationWithAddress } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { AddressOwnerEnum } from '../address/constants';
import { PrismaService } from 'prisma/prisma.service';
import { Address, Application, Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly addressService: AddressService,
    @Inject(forwardRef(() => SkillService))
    private readonly skillService: SkillService,
    @Inject(forwardRef(() => ContactService))
    private readonly contactService: ContactService,
    private readonly prismaService: PrismaService,
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    userId: number,
    dto: CreateApplicationRequestDto,
  ): Promise<TApplicationWithAddress> {
    return this.prismaService.$transaction(async (tx) => {
      //Application
      const data = this.__mapCreateDto(dto, userId);
      const application = await this.applicationRepository.create(data, tx);

      //Address
      const address = dto.address
        ? await this.addressService.upsert(
            dto.address,
            AddressOwnerEnum.APPLICATION,
            application.id,
            tx,
          )
        : null;

      //Skill
      if (dto.skillIds)
        await this.skillService.linkManyToApplication(
          application.id,
          dto.skillIds,
          userId,
          tx,
        );

      //Contact
      if (dto.contactIds)
        await this.contactService.linkManyToApplication(
          application.id,
          dto.contactIds,
          userId,
          tx,
        );

      return { ...application, address };
    });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    userId: number,
    dto: UpdateApplicationRequestDto,
  ): Promise<TApplicationWithAddress> {
    return this.prismaService.$transaction(async (tx) => {
      //Check
      await this.__findOneAndCheckOwnership(id, userId, tx);

      //Application
      const data = this.__mapUpdateDto(dto);
      const application = await this.applicationRepository.update(id, data, tx);

      //Address
      const address = await this.__resolveAddress(dto, id, tx);

      return { ...application, address };
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    //Check
    await this.__findOneAndCheckOwnership(id, userId);

    //Address
    await this.addressService.deleteByEntity(AddressOwnerEnum.APPLICATION, id);

    //Application
    await this.applicationRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(
    userId: number,
    dto: FindAllApplicationRequestDto,
  ): Promise<{ items: TApplicationWithAddress[]; total: number; page: number; limit: number }> {
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
        jobboard: dto.jobboard,
        currentStatus: dto.currentStatus,
        isFavorite: dto.isFavorite,
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
        return { ...app, address };
      }),
    );

    return { items: enrichedItems, total, page, limit };
  }

  async findOne(id: number, userId: number): Promise<TApplicationWithAddress> {
    const application = await this.__findOneAndCheckOwnership(id, userId);

    const address = await this.addressService.findByEntity(
      AddressOwnerEnum.APPLICATION,
      id,
    );

    return { ...application, address };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

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

  private __mapCreateDto(
    dto: CreateApplicationRequestDto,
    userId: number,
  ): Prisma.ApplicationUncheckedCreateInput {
    const { address, skillIds, contactIds, ...data } = dto;
    return { ...data, userId };
  }

  private __mapUpdateDto(
    dto: UpdateApplicationRequestDto,
  ): Prisma.ApplicationUncheckedUpdateInput {
    const { address, disconnectAddress, ...data } = dto;
    return { ...data };
  }

  private async __resolveAddress(
    dto: UpdateApplicationRequestDto,
    applicationId: number,
    tx: Prisma.TransactionClient,
  ): Promise<Address | null> {
    if (dto.disconnectAddress) {
      await this.addressService.deleteByEntity(
        AddressOwnerEnum.APPLICATION,
        applicationId,
        tx,
      );
      return null;
    }

    if (dto.address)
      return await this.addressService.upsert(
        dto.address,
        AddressOwnerEnum.APPLICATION,
        applicationId,
        tx,
      );

    return await this.addressService.findByEntity(
      AddressOwnerEnum.APPLICATION,
      applicationId,
      tx,
    );
  }
}
