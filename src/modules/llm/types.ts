import { ContractType, ExperienceLevel, RemotePolicy } from '@prisma/client';

/********* TYPES *********/

export type TExtractedAddress = {
  city?: string;
  postalCode?: string;
  street?: string;
  complement?: string;
  streetNumber?: string;
};

export type TExtractedContact = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  profession?: string;
};

export type TExtractedApplication = {
  title: string;
  company?: string;
  description?: string;
  contractType?: ContractType;
  salaryMin?: number;
  salaryMax?: number;
  experience?: ExperienceLevel;
  remotePolicy?: RemotePolicy;
  publishedAt?: string;
  skills?: string[];
  address?: TExtractedAddress;
  //TODO: Retirer contact non pertinent
  contacts?: TExtractedContact[];
};
