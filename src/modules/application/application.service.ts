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
import { TApplicationWithAddress } from './types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { AddressOwnerEnum } from '../address/constants/address-owner.enum';
import { PrismaService } from 'prisma/prisma.service';
import { Address, Prisma } from '@prisma/client';

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
  ) { }

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    userId: number,
    dto: CreateApplicationRequestDto,
  ): Promise<TApplicationWithAddress> {
    return this.prismaService.$transaction(async (tx) => {
      const data = this.__mapCreateDto(dto, userId);
      const application = await this.applicationRepository.create(data, tx);

      const address = dto.address
        ? await this.addressService.upsert(dto.address, AddressOwnerEnum.APPLICATION, application.id, tx)
        : null;

      if (dto.skills)
        await this.skillService.syncForApplication(dto.skills, application.id, userId, tx);

      if (dto.contactIds)
        await this.contactService.linkManyToApplication(application.id, dto.contactIds, userId, tx);

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
      const existing = await this.applicationRepository.findOneByIdAndByUserId(id, userId, tx);
      if (!existing)
        throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);

      const data = this.__mapUpdateDto(dto);
      const application = await this.applicationRepository.update(id, data, tx);

      const address = await this.__resolveAddress(dto, id, tx);

      if (dto.skills) {
        await this.skillService.unlinkAllFromApplication(id, tx);
        await this.skillService.syncForApplication(dto.skills, id, userId, tx);
      }

      if (dto.contactIds) {
        await this.contactService.unlinkAllFromApplication(id, tx);
        await this.contactService.linkManyToApplication(id, dto.contactIds, userId, tx);
      }

      return { ...application, address };
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    const existing = await this.applicationRepository.findOneByIdAndByUserId(id, userId);
    if (!existing)
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);

    await this.addressService.deleteByEntity(AddressOwnerEnum.APPLICATION, id);
    await this.applicationRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(userId: number): Promise<TApplicationWithAddress[]> {
    const applications = await this.applicationRepository.findAllByUserId(userId);

    return Promise.all(
      applications.map(async (app) => {
        const address = await this.addressService.findByEntity(AddressOwnerEnum.APPLICATION, app.id);
        return { ...app, address };
      }),
    );
  }

  async findOne(id: number, userId: number): Promise<TApplicationWithAddress> {
    const application = await this.applicationRepository.findOneByIdAndByUserId(id, userId);
    if (!application)
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);

    const address = await this.addressService.findByEntity(AddressOwnerEnum.APPLICATION, id);

    return { ...application, address };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private __mapCreateDto(
    dto: CreateApplicationRequestDto,
    userId: number,
  ): Prisma.ApplicationUncheckedCreateInput {
    const { address, skills, contactIds, ...data } = dto;
    return { ...data, userId };
  }

  private __mapUpdateDto(
    dto: UpdateApplicationRequestDto,
  ): Prisma.ApplicationUncheckedUpdateInput {
    const { address, skills, contactIds, disconnectAddress, ...data } = dto;
    return { ...data };
  }

  private async __resolveAddress(
    dto: UpdateApplicationRequestDto,
    applicationId: number,
    tx: Prisma.TransactionClient,
  ): Promise<Address | null> {
    if (dto.disconnectAddress) {
      await this.addressService.deleteByEntity(AddressOwnerEnum.APPLICATION, applicationId, tx);
      return null;
    }

    if (dto.address)
      return await this.addressService.upsert(dto.address, AddressOwnerEnum.APPLICATION, applicationId, tx);

    return await this.addressService.findByEntity(AddressOwnerEnum.APPLICATION, applicationId, tx);
  }
}
