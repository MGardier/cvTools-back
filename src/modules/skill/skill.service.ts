import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApplicationHasSkill, Prisma, Skill } from '@prisma/client';

import { SkillRepository } from './skill.repository';
import { ApplicationService } from '../application/application.service';
import { CreateSkillRequestDto } from './dto/request/create-skill.dto';
import { UpdateSkillRequestDto } from './dto/request/update-skill.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class SkillService {
  constructor(
    private readonly skillRepository: SkillRepository,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
  ) { }

  // =============================================================================
  //                            CREATE
  // =============================================================================

  async create(dto: CreateSkillRequestDto, userId: number): Promise<Skill> {
    return await this.skillRepository.create(dto.label, userId);
  }

  // =============================================================================
  //                            FIND OR CREATE
  // =============================================================================

  async findOrCreate(label: string, userId: number, tx?: Prisma.TransactionClient): Promise<Skill> {

    const existing = await this.skillRepository.findByLabel(label, tx);
    if (existing)
      return existing;

    return await this.skillRepository.create(label, userId, tx);
  }

  async findOrCreateMany(labels: string[], userId: number, tx?: Prisma.TransactionClient): Promise<Skill[]> {

    return await Promise.all(
      labels.map(async (label) => await this.findOrCreate(label, userId, tx)),
    );

  }

  // =============================================================================
  //                            UPDATE
  // =============================================================================

  async update(id: number, userId: number, dto: UpdateSkillRequestDto): Promise<Skill> {
    const skill = await this.__findOneAndCheckOwnership(id, userId);
    await this.__ensureSkillIsNotLinked(skill.id);

    return await this.skillRepository.update(skill.id, dto);
  }


  // =============================================================================
  //                            DELETE
  // =============================================================================

  async delete(id: number, userId: number): Promise<void> {
    const skill = await this.__findOneAndCheckOwnership(id, userId);
    await this.__ensureSkillIsNotLinked(skill.id);

    await this.skillRepository.delete(skill.id);
  }


  // =============================================================================
  //                            FIND
  // =============================================================================

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.findAll();
  }

  async findOneById
    (id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOneById(id);
    if (!skill) {
      throw new NotFoundException(ErrorCodeEnum.SKILL_NOT_FOUND_ERROR);
    }
    return skill;
  }

  async findAllByApplicationId(
    applicationId: number,
    userId: number,
  ): Promise<Skill[]> {
    await this.applicationService.findOne(applicationId, userId);

    return await this.skillRepository.findAllByApplicationId(applicationId);
  }


  // =============================================================================
  //                  APPLICATION-SKILL (RELATION LINK)
  // =============================================================================

  async syncForApplication(
    labels: string[],
    applicationId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const skills = await this.findOrCreateMany(labels, userId, tx);
    const skillIds = skills.map((skill) => skill.id);

    await this.skillRepository.addManyApplicationLinks(applicationId, skillIds, tx);
  }

  async linkToApplicationDirect(
    applicationId: number,
    skillId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasSkill> {
    return await this.skillRepository.addApplicationLink(applicationId, skillId, tx);
  }

  async unlinkFromApplication(
    applicationId: number,
    skillId: number,
    userId: number,
  ): Promise<void> {
    await this.applicationService.findOne(applicationId, userId);

    await this.skillRepository.removeApplicationLink(applicationId, skillId);
  }

  async unlinkAllFromApplication(applicationId: number, tx?: Prisma.TransactionClient): Promise<void> {
    await this.skillRepository.removeAllApplicationLinks(applicationId, tx);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __findOneAndCheckOwnership(
    id: number,
    userId: number,
  ): Promise<Skill> {
    const skill = await this.skillRepository.findOneByIdAndByUserId(id, userId);

    if (!skill)
      throw new NotFoundException(ErrorCodeEnum.SKILL_NOT_FOUND_ERROR);

    return skill;
  }

  private async __ensureSkillIsNotLinked(id: number): Promise<void> {
    const count = await this.skillRepository.countApplicationLinks(id);

    if (count > 0)
      throw new ConflictException(ErrorCodeEnum.SKILL_UPDATE_CONFLICT);
  }
}
