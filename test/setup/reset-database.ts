import { PrismaService } from "prisma/prisma.service";

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.userToken.deleteMany();
  await prisma.user.deleteMany();
}