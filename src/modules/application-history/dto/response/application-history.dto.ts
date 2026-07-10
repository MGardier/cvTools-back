import { Expose } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';

// ============================================================================
//                                    LEGACY
//         Module outside Lot 1 scope (future module) - entirely legacy
// ============================================================================

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
