import { PrismaService } from 'prisma/prisma.service';

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  // Applications first: the user relation has no cascade on user deletion.
  await prisma.application.deleteMany();
  await prisma.userToken.deleteMany();
  await prisma.user.deleteMany();
}
