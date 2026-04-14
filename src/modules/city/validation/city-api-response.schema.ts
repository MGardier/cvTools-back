import { z } from 'zod';

export const cityApiItemSchema = z
  .object({
    code: z.string(),
    nom: z.string(),
    codesPostaux: z.array(z.string()).catch([]),
    codeDepartement: z.string().optional().catch(undefined),
    codeRegion: z.string().optional().catch(undefined),
    population: z.number().optional().catch(undefined),
  })
  .strip();

export const cityApiResponseSchema = z.array(cityApiItemSchema);

export type TRawCityApiItem = z.infer<typeof cityApiItemSchema>;
