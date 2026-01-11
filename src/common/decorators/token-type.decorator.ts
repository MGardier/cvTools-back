import { SetMetadata } from '@nestjs/common';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';



export const TOKEN_TYPE = 'tokenType';
export const Token_Type = (type: TokenType.ACCESS | TokenType.REFRESH) =>
  SetMetadata('tokenType', type);
