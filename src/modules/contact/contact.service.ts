import {
  Injectable,
  NotFoundException,
  ConflictException,
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
  ) {}

  // =============================================================================
  //                               CREATE
  // =============================================================================

  async create(
    userId: number,
    dto: CreateContactRequestDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Contact> {
    return await this.contactRepository.create(
      this.__mapCreateDto(dto, userId),
      tx,
    );
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

    return await this.contactRepository.update(contact.id, dto);
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    const contact = await this.__findOneAndCheckOwnership(id, userId);
    await this.__ensureContactIsNotLinked(contact.id);

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

  async linkManyToApplication(
    applicationId: number,
    contactIds: number[],
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await Promise.all(
      contactIds.map((id) => this.__findOneAndCheckOwnership(id, userId)),
    );

    await this.contactRepository.addManyApplicationLinks(
      applicationId,
      contactIds,
      tx,
    );
  }

  async linkToApplication(
    applicationId: number,
    contactId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasContact> {
    const contact = await this.__findOneAndCheckOwnership(contactId, userId);
    return await this.contactRepository.addApplicationLink(
      applicationId,
      contact.id,
      tx,
    );
  }

  async unlinkFromApplication(
    applicationId: number,
    contactId: number,
    userId: number,
  ): Promise<void> {
    await this.applicationService.findOne(applicationId, userId);

    await this.contactRepository.removeApplicationLink(
      applicationId,
      contactId,
    );
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
      ...dto,
      createdBy: userId,
    };
  }

  private async __ensureContactIsNotLinked(id: number): Promise<void> {
    const count = await this.contactRepository.countApplicationLinks(id);

    if (count > 0)
      throw new ConflictException(ErrorCodeEnum.CONTACT_DELETE_CONFLICT);
  }

  private async __findOneAndCheckOwnership(
    id: number,
    userId: number,
  ): Promise<Contact> {
    const contact = await this.contactRepository.findOneByIdAndByUserId(
      id,
      userId,
    );

    if (!contact)
      throw new NotFoundException(ErrorCodeEnum.CONTACT_NOT_FOUND_ERROR);

    return contact;
  }
}
