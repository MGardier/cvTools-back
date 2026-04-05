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
  .strip()
  .optional();

const extractedSkillSchema = z
  .array(z.string().max(100))
  .max(20)
  .optional()
  .catch(undefined)
  .transform((skills) => {
    if (!skills) return undefined;
    
    //Remove dupplication
    const seen = new Set<string>();
    return skills.filter((s) => {
      const key = s.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

export const extractedApplicationSchema = z
  .object({
    //String
    title: z.string().min(1).max(150),
    company: z.string().max(150).optional(),
    description: z.string().max(20_000).optional(),
    
    //Number
    salaryMin: z.number().positive().max(500_000).optional().catch(undefined),
    salaryMax: z.number().positive().max(500_000).optional().catch(undefined),

    //Boolean
    isSuccess: z.boolean(),

    //Date
    publishedAt: z.iso.date().optional().catch(undefined),

    //Enum  
    contractType: contractTypeEnum.optional().catch(undefined),
    experience: experienceEnum.optional().catch(undefined),
    remotePolicy: remotePolicyEnum.optional().catch(undefined),
    jobboard: jobboardEnum.optional().catch(undefined),

    //Object
    skills: extractedSkillSchema.catch(undefined),
    address: extractedAddressSchema.catch(undefined),

  })
  // Removes any unknown fields
  .strip()
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
