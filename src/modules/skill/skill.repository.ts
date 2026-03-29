import { Injectable } from '@nestjs/common';
import { ApplicationHasSkill, Prisma, Skill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SkillRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // =============================================================================
  //                                 CREATE
  // =============================================================================

  async create(
    data: Prisma.SkillUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill> {
    const client = tx ?? this.prismaService;

    return await client.skill.create({ data });
  }

  async upsertByLabel(
    label: string,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill> {
    const client = tx ?? this.prismaService;

    return await client.skill.upsert({
      where: { label },
      create: { label, createdBy: userId },
      update: {},
    });
  }

  // =============================================================================
  //                               UPDATE
  // =============================================================================

  async update(
    id: number,
    data: Prisma.SkillUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill> {
    const client = tx ?? this.prismaService;

    return await client.skill.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  //                               DELETE
  // =============================================================================

  async delete(id: number, tx?: Prisma.TransactionClient): Promise<Skill> {
    const client = tx ?? this.prismaService;

    return await client.skill.delete({
      where: { id },
    });
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

  async findAll(tx?: Prisma.TransactionClient): Promise<Skill[]> {
    const client = tx ?? this.prismaService;

    return await client.skill.findMany({
      orderBy: { label: 'asc' },
    });
  }

  async search(
    search?: string,
    limit = 20,
    tx?: Prisma.TransactionClient,
  ): Promise<(Skill & { _count: { applicationSkills: number } })[]> {
    const client = tx ?? this.prismaService;

    return await client.skill.findMany({
      where: search
        ? { label: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: { _count: { select: { applicationSkills: true } } },
      orderBy: { label: 'asc' },
      take: limit,
    });
  }

  async findOneById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill | null> {
    const client = tx ?? this.prismaService;

    return await client.skill.findUnique({
      where: { id },
    });
  }

  async findOneByIdAndByUserId(
    id: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill | null> {
    const client = tx ?? this.prismaService;

    return await client.skill.findFirst({
      where: { id, createdBy: userId },
    });
  }

  async countApplicationLinks(
    skillId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx ?? this.prismaService;

    return await client.applicationHasSkill.count({
      where: { skillId },
    });
  }

  async findAllByApplicationId(
    applicationId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Skill[]> {
    const client = tx ?? this.prismaService;

    return await client.skill.findMany({
      where: { applicationSkills: { some: { applicationId } } },
      orderBy: { label: 'asc' },
    });
  }

  // =============================================================================
  //                  APPLICATION-SKILL (RELATION LINK)
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
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.applicationHasSkill.delete({
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
