import { z } from 'zod';

const contractTypeEnum = z.enum(['CDI', 'CDD', 'FREELANCE', 'ALTERNANCE']);
const experienceEnum = z.enum(['JUNIOR', 'MID', 'SENIOR']);
const remotePolicyEnum = z.enum(['FULL', 'HYBRID', 'ONSITE']);
const jobboardEnum = z.enum([
  'LINKEDIN',
  'INDEED',
  'WTTJ',
  'FRANCE_TRAVAIL',
  'GLASSDOOR',
  'APEC',
  'HELLO_WORK',
  'METEO_JOB',
  'UNKNOW',
]);

const extractedAddressSchema = z
  .object({
    city: z.string().optional(),
    postalCode: z.string().optional(),
    street: z.string().optional(),
    complement: z.string().optional(),
    streetNumber: z.string().optional(),
  })
  .optional();

export const extractedApplicationSchema = z
  .object({
    isSuccess: z.boolean(),
    title: z.string().min(1),
    company: z.string().optional(),
    description: z.string().max(20_000).optional(),
    contractType: contractTypeEnum.optional().catch(undefined),
    salaryMin: z.number().positive().optional().catch(undefined),
    salaryMax: z.number().positive().optional().catch(undefined),
    experience: experienceEnum.optional().catch(undefined),
    remotePolicy: remotePolicyEnum.optional().catch(undefined),
    publishedAt: z.string().optional(),
    skills: z.array(z.string()).optional().catch(undefined),
    jobboard: jobboardEnum.optional().catch(undefined),
    address: extractedAddressSchema.catch(undefined),
  })
  // If both salaries present but incoherent (min > max), discard both
  .transform((data) => {
    if (
      data.salaryMin != null &&
      data.salaryMax != null &&
      data.salaryMin > data.salaryMax
    ) {
      return { ...data, salaryMin: undefined, salaryMax: undefined };
    }
    return data;
  });

export type TValidatedExtractedApplication = z.infer<
  typeof extractedApplicationSchema
>;
