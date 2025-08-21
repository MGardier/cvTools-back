import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserTokenService } from '../user-token/user-token.service';
import { TOKEN_TYPE } from 'src/decorators/token-type.decorator';
import { TokenType } from 'src/user-token/enum/token-type.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userTokenService: UserTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    if (this.__IsPublicRoute(context)) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.__extractToken(request);
    if (!token) throw new UnauthorizedException();

    try {
      const tokenType = this.__getTokenType(context);
      const { payload } = await this.userTokenService.decodeAndGet(token, tokenType);

      request['user'] = payload;
      if (tokenType === 'REFRESH') request['token'] = token;

      return true;
    } catch (e){

      throw new UnauthorizedException();
    }
  }

  private __extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private __IsPublicRoute(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private __getTokenType(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<TokenType>(
      TOKEN_TYPE,
      [context.getHandler(), context.getClass()],
    );
  }


}
