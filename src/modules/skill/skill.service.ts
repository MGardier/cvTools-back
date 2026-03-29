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
  ) {}

  // =============================================================================
  //                            CREATE
  // =============================================================================

  async create(dto: CreateSkillRequestDto, userId: number) {
    const skill = await this.skillRepository.create(
      this.__mapCreateData(dto.label, userId),
    );
    return { ...skill, isOwner: true, isUsed: false };
  }

  async findOrCreate(dto: CreateSkillRequestDto, userId: number) {
    const skill = await this.skillRepository.upsertByLabel(dto.label, userId);
    return this.__enrichWithMeta(skill, userId);
  }

  // =============================================================================
  //                            UPDATE
  // =============================================================================

  async update(id: number, userId: number, dto: UpdateSkillRequestDto) {
    const skill = await this.__findOneAndCheckOwnership(id, userId);
    await this.__ensureSkillIsNotLinked(skill.id);

    const updated = await this.skillRepository.update(skill.id, {
      label: dto.label,
    });
    return { ...updated, isOwner: true, isUsed: false };
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

  async search(userId: number, search?: string) {
    const skills = await this.skillRepository.search(search);
    return skills.map((skill) => ({
      ...skill,
      isOwner: skill.createdBy === userId,
      isUsed: skill._count.applicationSkills > 0,
    }));
  }

  async findOneById(id: number, userId?: number) {
    const skill = await this.skillRepository.findOneById(id);
    if (!skill)
      throw new NotFoundException(ErrorCodeEnum.SKILL_NOT_FOUND_ERROR);

    if (userId !== undefined) {
      return this.__enrichWithMeta(skill, userId);
    }
    return { ...skill, isOwner: false, isUsed: false };
  }

  async findAllByApplicationId(applicationId: number, userId: number) {
    await this.applicationService.findOne(applicationId, userId);

    const skills =
      await this.skillRepository.findAllByApplicationId(applicationId);
    return Promise.all(
      skills.map((skill) => this.__enrichWithMeta(skill, userId)),
    );
  }

  // =============================================================================
  //                  APPLICATION-SKILL (RELATION LINK)
  // =============================================================================

  async linkManyToApplication(
    applicationId: number,
    skillIds: number[],
    _userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await Promise.all(skillIds.map((id) => this.findOneById(id)));
    await this.skillRepository.addManyApplicationLinks(
      applicationId,
      skillIds,
      tx,
    );
  }

  async linkToApplication(
    applicationId: number,
    skillId: number,
    _userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasSkill> {
    const skill = await this.findOneById(skillId);
    return await this.skillRepository.addApplicationLink(
      applicationId,
      skill.id,
      tx,
    );
  }

  async unlinkFromApplication(
    applicationId: number,
    skillId: number,
    userId: number,
  ): Promise<void> {
    await this.applicationService.findOne(applicationId, userId);

    await this.skillRepository.removeApplicationLink(applicationId, skillId);
  }

  async unlinkAllFromApplication(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.skillRepository.removeAllApplicationLinks(applicationId, tx);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  private async __enrichWithMeta(skill: Skill, userId: number) {
    const count = await this.skillRepository.countApplicationLinks(skill.id);
    return {
      ...skill,
      isOwner: skill.createdBy === userId,
      isUsed: count > 0,
    };
  }

  private __mapCreateData(
    label: string,
    userId: number,
  ): Prisma.SkillUncheckedCreateInput {
    return { label, createdBy: userId };
  }

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
