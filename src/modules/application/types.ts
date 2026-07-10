import { Application, Address, Skill, Contact } from '@prisma/client';

// ============================================================================
//                                  REFACTORED
//     New code compliant with the Candidature refactor (Lot 1 - CAND-xxx)
// ============================================================================

// ============================================================================
//                                    LEGACY
//     Old code - move above to REFACTORED when reused/adapted, else delete
// ============================================================================

export type TApplicationWithAddress = Application & { address: Address | null };

export type TApplicationWithAddressAndSkills = TApplicationWithAddress & {
  skills: Skill[];
};

export type TApplicationDetail = TApplicationWithAddress & {
  skills: Skill[];
  contacts: Contact[];
};

export enum EApplicationSortField {
  CREATED_AT = 'createdAt',
  APPLIED_AT = 'appliedAt',
  CURRENT_STATUS = 'currentStatus',
  TITLE = 'title',
  JOBBOARD = 'jobboard',
}
