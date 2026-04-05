import { Expose } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationHistoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Expose()
  status: ApplicationStatus;

  @Expose()
  doneAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  applicationId: number;
}
