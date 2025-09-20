import { Prisma } from "@prisma/client";

export interface OptionRepository<TdataSelectedColumns>  {
  tx?: Prisma.TransactionClient;
  selectedColumns?: (keyof TdataSelectedColumns)[];
}