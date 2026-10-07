/********* TYPES *********/

// Standalone unions (the Prisma enums moved out with the application domain):
// values mirror APPLICATION_JSON_SCHEMA and extractedApplicationSchema.
export type TContractType = 'CDI' | 'CDD' | 'FREELANCE' | 'ALTERNANCE';

export type TExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR';

export type TRemotePolicy = 'FULL' | 'HYBRID' | 'ONSITE';

export type TJobboard =
  | 'LINKEDIN'
  | 'INDEED'
  | 'WTTJ'
  | 'FRANCE_TRAVAIL'
  | 'GLASSDOOR'
  | 'APEC'
  | 'HELLO_WORK'
  | 'METEO_JOB'
  | 'UNKNOW';

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
  contractType?: TContractType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experience?: TExperienceLevel | null;
  remotePolicy?: TRemotePolicy | null;
  jobboard?: TJobboard;
  isSuccess: boolean;
  publishedAt?: string;
  skills?: string[];
  address?: TExtractedAddress;
};
