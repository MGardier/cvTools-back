import { Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class CredentialsAuthGuard extends AuthGuard('local') {
  constructor(@Optional() options?: AuthModuleOptions) {
    super(options);
  }
}
