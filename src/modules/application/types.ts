import { Application, Address } from '@prisma/client';

export type TApplicationWithAddress = Application & { address: Address | null };
