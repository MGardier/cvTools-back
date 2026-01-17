import { SetMetadata } from '@nestjs/common';
import { TokenType } from 'src/modules/user-token/enums/token-type.enum';



export const TOKEN_TYPE = 'tokenType';
export const RequireTokenType = (type: TokenType.ACCESS | TokenType.REFRESH) =>
  SetMetadata(TOKEN_TYPE, type);
