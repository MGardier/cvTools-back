import { Prisma, PrismaTokenType } from '@prisma/client';
import { TSortItem } from 'src/shared/types/repository.types';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';

export abstract class UtilRepository {
  static getSortedColumns<TData>(
    columns?: TSortItem<TData>[],
  ): Record<keyof TData, Prisma.SortOrder>[] {
    if (!columns) return [];
    return columns?.map((column) => {
      return { [column.field]: column.direction } as Record<
        keyof TData,
        Prisma.SortOrder
      >;
    });
  }

  static toPrismaTokenType(tokenType: TokenType): PrismaTokenType {
    const mapping: Partial<Record<TokenType, PrismaTokenType>> = {
      [TokenType.REFRESH]: PrismaTokenType.REFRESH,
      [TokenType.FORGOT_PASSWORD]: PrismaTokenType.FORGOT_PASSWORD,
      [TokenType.CONFIRM_ACCOUNT]: PrismaTokenType.CONFIRM_ACCOUNT,
    };
    const result = mapping[tokenType];
    if (!result) throw new Error(`No Prisma mapping for token type: ${tokenType}`);
    return result;
  }
}
