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
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    userId: number,
    dto: CreateApplicationRequestDto,
  ): Promise<TApplicationWithAddress> {
    return this.prismaService.$transaction(async (tx) => {
      let address: Address | null = null;

      //Application
      const application = await this.applicationRepository.create(dto, userId, tx);

      //Address
      if (dto.address) 
        address = await this.addressService.upsert(
          dto.address,
          AddressOwnerEnum.APPLICATION,
          application.id,
          tx,
        );
      

      //Skills
      if (dto.skills)
        await this.skillService.syncForApplication(dto.skills, application.id, userId, tx);
      

      //Contacts
      if (dto.contacts)
        await this.contactService.createMany(userId, dto.contacts, application.id, tx);
    

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
    const existingApplication = await this.applicationRepository.findOneById(
      id,
      userId,
    );

    if (!existingApplication) 
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);
    
    return this.prismaService.$transaction(async (tx) => {

      const application = await this.applicationRepository.update(id, dto, tx);

      //Address
      const address = await this.__resolveAddress(dto, id, tx);

      //Skills
      if (dto.skills) {
        await this.skillService.unlinkAllFromApplication(id, tx);
        await this.skillService.syncForApplication(dto.skills, id, userId, tx);
      }

      //Contact

      return { ...application, address };
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    const existingApplication = await this.applicationRepository.findOneById(
      id,
      userId,
    );
    if (!existingApplication)
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);

    await this.addressService.deleteByEntity(AddressOwnerEnum.APPLICATION, id);
    await this.applicationRepository.delete(id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(userId: number): Promise<TApplicationWithAddress[]> {
    const applications = await this.applicationRepository.findAll(userId);

    return Promise.all(
      applications.map(async (app) => {
        const address = await this.addressService.findByEntity(AddressOwnerEnum.APPLICATION, app.id);
        return { ...app, address };
      }),
    );
  }

  async findOne(id: number, userId: number): Promise<TApplicationWithAddress> {
    const application = await this.applicationRepository.findOneById(
      id,
      userId,
    );
    if (!application) 
      throw new NotFoundException(ErrorCodeEnum.APPLICATION_NOT_FOUND_ERROR);
    

    const address = await this.addressService.findByEntity(AddressOwnerEnum.APPLICATION, id);

    return { ...application, address };
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

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
