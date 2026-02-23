import { Injectable } from '@nestjs/common';
import { ApplicationHasSkill, Prisma, Skill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { TUpdateSkill } from './types';
import { mapSkillDtoToCreateData } from 'src/shared/utils/util-repository';

@Injectable()
export class SkillRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                                 CREATE
  // =============================================================================

  async create(label: string, userId: number, tx?: Prisma.TransactionClient): Promise<Skill> {
    const client = tx ?? this.prismaService;
    const data = mapSkillDtoToCreateData(label, userId);

    return await client.skill.create({ data });
  }

// =============================================================================
//                                UPDATE
// =============================================================================
  async update(id: number, data: TUpdateSkill): Promise<Skill> {
    return await this.prismaService.skill.update({
      where: { id },
      data,
    });
  }

// =============================================================================
//                         DELETE
// =============================================================================
  async delete(id: number): Promise<Skill> {
    return await this.prismaService.skill.delete({
      where: { id },
    });
  }

// =============================================================================
//                         FIND
// =============================================================================

  async findAll(): Promise<Skill[]> {
    return await this.prismaService.skill.findMany({
      orderBy: { label: 'asc' },
    });
  }

  async findOneById(id: number, tx?: Prisma.TransactionClient): Promise<Skill | null> {
    const client = tx ?? this.prismaService;

    return await client.skill.findUnique({
      where: { id },
    });
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
  ): Promise<Skill | null> {
    return await this.prismaService.skill.findFirst({
      where: { id, createdBy: userId },
    });
  }

  async findByLabel(label: string, tx?: Prisma.TransactionClient): Promise<Skill | null> {
    const client = tx ?? this.prismaService;

    return await client.skill.findUnique({
      where: { label },
    });
  }

  async countApplicationLinks(skillId: number): Promise<number> {
    return await this.prismaService.applicationHasSkill.count({
      where: { skillId },
    });
  }

  async findAllByApplicationId(applicationId: number): Promise<Skill[]> {
    return await this.prismaService.skill.findMany({
      where: { applicationSkills: { some: { applicationId } } },
      orderBy: { label: 'asc' },
    });
  }

// =============================================================================
//               APPLICATION-SKILL (RELATION LINK)
// =============================================================================

  async addApplicationLink(
    applicationId: number,
    skillId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationHasSkill> {
    const client = tx ?? this.prismaService;

    return await client.applicationHasSkill.create({
      data: { applicationId, skillId },
    });
  }

  async addManyApplicationLinks(
    applicationId: number,
    skillIds: number[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasSkill.createMany({
      data: skillIds.map((skillId) => ({ applicationId, skillId })),
      skipDuplicates: true,
    });
  }

  async removeApplicationLink(
    applicationId: number,
    skillId: number,
  ): Promise<void> {
    await this.prismaService.applicationHasSkill.delete({
      where: {
        applicationId_skillId: { applicationId, skillId },
      },
    });
  }

  async removeAllApplicationLinks(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasSkill.deleteMany({
      where: { applicationId },
    });
  }
}
