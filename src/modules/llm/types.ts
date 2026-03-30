import type { Application, Address } from '@prisma/client';

/********* TYPES *********/

export type TExtractedAddress = Partial<
  Pick<Address, 'city' | 'postalCode' | 'street' | 'complement' | 'streetNumber'>
>;

export type TExtractedApplication = Pick<Application, 'title'> &
  Partial<
    Pick<
      Application,
      | 'company'
      | 'description'
      | 'contractType'
      | 'salaryMin'
      | 'salaryMax'
      | 'experience'
      | 'remotePolicy'
      | 'jobboard'
    >
  > & {
    isSuccess: boolean;
    publishedAt?: string; 
    skills?: string[];
    address?: TExtractedAddress;
  };
