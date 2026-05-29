import { Prisma, StatusTodo } from '@prisma/client';

export type TTodoStatusCounts = Partial<Record<StatusTodo, number>>;

export type TTodoWithCompany = Prisma.TodoGetPayload<{
  include: { application: { select: { company: true } } };
}>;
