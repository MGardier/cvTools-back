import { Expose } from 'class-transformer';
import {
  ApplicationStatus,
  ApplicationType,
  Completeness,
  CreationMode,
  RemotePolicy,
} from '@prisma/client';

// ============================================================================
//                                 REFACTORED
//     New code compliant with the Candidature refactor (Lot 1 - CAND-001)
// ============================================================================

export class ApplicationResponseDto {
  @Expose()
  id!: number;

  // Identification
  @Expose()
  title!: string | null;

  @Expose()
  company!: string | null;

  @Expose()
  subject!: string | null;

  @Expose()
  url!: string | null;

  @Expose()
  source!: string | null;

  // Structured description (CAND-005)
  @Expose()
  descriptionSummary!: string | null;

  @Expose()
  descriptionRole!: string | null;

  @Expose()
  descriptionMissions!: string | null;

  @Expose()
  descriptionProfile!: string | null;

  @Expose()
  descriptionStackEnv!: string | null;

  @Expose()
  descriptionAdditional!: string | null;

  // Conditions (CAND-006)
  @Expose()
  contractType!: string | null;

  @Expose()
  city!: string | null;

  @Expose()
  postalCode!: string | null;

  @Expose()
  salary!: string | null;

  @Expose()
  experience!: string | null;

  @Expose()
  remotePolicy!: RemotePolicy;

  // Lifecycle
  @Expose()
  applicationType!: ApplicationType | null;

  @Expose()
  creationMode!: CreationMode;

  @Expose()
  completeness!: Completeness;

  @Expose()
  currentStatus!: ApplicationStatus;

  @Expose()
  isArchived!: boolean;

  // Dates
  @Expose()
  appliedAt!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
