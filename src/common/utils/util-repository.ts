import { Prisma, PrismaTokenType } from "@prisma/client";
import { TSortItem } from "src/common/types/repository.types";
import { TokenType } from "src/modules/user-token/enums/token-type.enum";

export abstract class UtilRepository {


    static getSortedColumns<TData>(columns ?: TSortItem<TData>[] ) :Record<keyof TData, Prisma.SortOrder>[]{
        if(!columns) return  [];
        return  columns?.map((column) => {
           return  {[column.field ] :column.direction} as Record<keyof TData, Prisma.SortOrder> ;
        })

    }

    static toPrismaTokenType(tokenType: TokenType): PrismaTokenType {
        const mapping = {
            [TokenType.REFRESH]: PrismaTokenType.REFRESH,
            [TokenType.FORGOT_PASSWORD]: PrismaTokenType.FORGOT_PASSWORD,
            [TokenType.CONFIRM_ACCOUNT]: PrismaTokenType.CONFIRM_ACCOUNT
        };
        return mapping[tokenType];
    }
}


