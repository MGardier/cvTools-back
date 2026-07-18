import type {
  ContractType,
  ExperienceLevel,
  Jobboard,
  RemotePolicy,
} from '@prisma/client';

/********* TYPES *********/

export type TExtractStructureTextParams = {
  fetchText?: string;
  userRawText?: string;
  sourceUrl?: string;
};

// Standalone shape (the Address model moved out with the application domain).
export type TExtractedAddress = {
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  complement?: string | null;
  streetNumber?: string | null;
};

// Standalone shape (LLM extraction is outside the Candidature refactor Lot 1):
// mirrors the pre-refactor Application columns, no longer present on the model.
export type TExtractedApplication = {
  title: string;
  company?: string | null;
  description?: string | null;
  contractType?: ContractType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experience?: ExperienceLevel | null;
  remotePolicy?: RemotePolicy | null;
  jobboard?: Jobboard;
  isSuccess: boolean;
  publishedAt?: string;
  skills?: string[];
  address?: TExtractedAddress;
};
