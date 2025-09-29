import { Prisma, PrismaTokenType } from "@prisma/client";
import { SortItem } from "src/interfaces/filter-options.interface";
import { TokenType } from "src/user-token/enum/token-type.enum";

export abstract class UtilRepository {

    static getSelectedColumns<TData>(columns?: (keyof TData)[]): Record<keyof TData, boolean> | undefined {

       return columns?.reduce((acc, column) => {
            acc[column] = true;
            return acc;
        }, {} as Record<keyof TData, boolean>);
    }

    static getSortedColumns<TData>(columns ?: SortItem<TData>[] ) :Record<keyof TData, Prisma.SortOrder>[]{
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


