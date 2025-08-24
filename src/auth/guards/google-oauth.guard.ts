import { ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { ErrorCodeEnum } from "src/enums/error-codes.enum";


@Injectable()
export class GoogleOauthGuard extends AuthGuard("google") {
 constructor(private configService: ConfigService) {
    super();
  }

  handleRequest(error: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    
    if (error || !user) {

       const errorCode = Object.values(ErrorCodeEnum).includes(error.message) ? error.message : ErrorCodeEnum.INTERNAL_SERVER_ERROR
      const redirectUrl = `${this.configService.get('FRONT_URL_OAUTH_CALLBACK_ERROR')}?errorCode=${encodeURIComponent(errorCode)}`;
      
      return response.redirect(redirectUrl);
    }
    
    return user;
  }
}