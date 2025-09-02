import { Prisma } from "@prisma/client";

export interface OptionRepositoryInterface<TdataSelectedColumns>  {
  tx?: Prisma.TransactionClient;
  selectedColumns?: (keyof TdataSelectedColumns)[];
}