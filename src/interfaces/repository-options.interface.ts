import { PrismaTransactionClientType } from "src/types/prisma-transaction-client.type";





export interface RepositoryOptionsInterface<T> {
  selectedColumns?: (keyof T)[]
  tx?:  PrismaTransactionClientType

}