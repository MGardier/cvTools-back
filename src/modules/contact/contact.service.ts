import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApplicationHasContact, Contact, Prisma } from '@prisma/client';

import { ContactRepository } from './contact.repository';
import { ApplicationService } from '../application/application.service';
import { CreateContactRequestDto } from './dto/request/create-contact.dto';
import { UpdateContactRequestDto } from './dto/request/update-contact.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) { }

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    userId: number,
    dto: CreateContactRequestDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact> {
    return await this.contactRepository.create(this.__mapCreateDto(dto, userId), tx);
  }

  async createMany(
    userId: number,
    dtos: CreateContactRequestDto[],
    tx?: Prisma.TransactionClient,
  ): Promise<Contact[]> {
    const contacts: Contact[] = [];

    for (const dto of dtos) {
      const contact = await this.contactRepository.create(this.__mapCreateDto(dto, userId), tx);
      contacts.push(contact);
    }

    return contacts;
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    userId: number,
    dto: UpdateContactRequestDto,
  ): Promise<Contact> {
    const contact = await this.__findOneAndCheckOwnership(id, userId);

    return await this.contactRepository.update(contact.id, this.__mapUpdateDto(dto));
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    const contact = await this.__findOneAndCheckOwnership(id, userId);

    await this.contactRepository.delete(contact.id);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAllByUserId(userId: number): Promise<Contact[]> {
    return await this.contactRepository.findAllByUserId(userId);
  }

  async findOne(id: number, userId: number): Promise<Contact> {
    return await this.__findOneAndCheckOwnership(id, userId);
  }

  async findAllByApplicationId(
    applicationId: number,
    userId: number,
  ): Promise<Contact[]> {
    await this.applicationService.findOne(applicationId, userId);

    return await this.contactRepository.findAllByApplicationId(applicationId);
  }

  // =============================================================================
  //                  APPLICATION-CONTACT (RELATION LINK)
  // =============================================================================

  async syncForApplication(
    dtos: CreateContactRequestDto[],
    applicationId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const contacts = await this.createMany(userId, dtos, tx);
    const contactIds = contacts.map((contact) => contact.id);

    await this.contactRepository.addManyApplicationLinks(applicationId, contactIds, tx);
  }

  async linkManyToApplication(
    applicationId: number,
    contactIds: number[],
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await Promise.all(contactIds.map((id) => this.__findOneAndCheckOwnership(id, userId)));

    await this.contactRepository.addManyApplicationLinks(applicationId, contactIds, tx);
  }

  async linkToApplication(
    applicationId: number,
    contactId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasContact> {
    return await this.contactRepository.addApplicationLink(applicationId, contactId, tx);
  }

  async unlinkFromApplication(
    applicationId: number,
    contactId: number,
    userId: number,
  ): Promise<void> {
    await this.applicationService.findOne(applicationId, userId);

    await this.contactRepository.removeApplicationLink(applicationId, contactId);
  }

  async unlinkAllFromApplication(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.contactRepository.removeAllApplicationLinks(applicationId, tx);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private __mapCreateDto(
    dto: CreateContactRequestDto,
    userId: number,
  ): Prisma.ContactUncheckedCreateInput {
    return {
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      phone: dto.phone,
      profession: dto.profession,
      createdBy: userId,
    };
  }

  private __mapUpdateDto(
    dto: UpdateContactRequestDto,
  ): Prisma.ContactUncheckedUpdateInput {
    return {
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      phone: dto.phone,
      profession: dto.profession,
    };
  }

  private async __findOneAndCheckOwnership(
    id: number,
    userId: number,
  ): Promise<Contact> {
    const contact = await this.contactRepository.findOneByIdAndByUserId(id, userId);

    if (!contact)
      throw new NotFoundException(
        ErrorCodeEnum.CONTACT_NOT_FOUND_ERROR,
      );

    return contact;
  }
}
