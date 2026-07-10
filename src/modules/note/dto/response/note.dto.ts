import { Expose } from 'class-transformer';

// ============================================================================
//                                    LEGACY
//         Module outside Lot 1 scope (future module) - entirely legacy
// ============================================================================

export class NoteResponseDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  applicationId: number;
}
