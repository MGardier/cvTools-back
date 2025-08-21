import { PrismaTokenType } from "@prisma/client";
import { TokenType } from "src/user-token/enum/token-type.enum";

export abstract class UtilRepository {

    static getSelectedColumns<T>(columns?: (keyof T)[]): Record<keyof T, boolean> | undefined {

        const select = columns?.reduce((acc, column) => {
            acc[column] = true;
            return acc;
        }, {} as Record<keyof T, boolean>);
        return select;
    }


    /* TODO :l à changer */
    static addColumnsToSelectedColumns<T>(addColumns: (keyof T)[],columns?: (keyof T)[], ) : (keyof T)[] | undefined {
        return columns
            ? [...new Set([...columns, ...addColumns])]
            : undefined;
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


