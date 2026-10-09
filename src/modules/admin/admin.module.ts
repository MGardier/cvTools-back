import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminInvitationModule } from '../admin-invitation/admin-invitation.module.js';
import { GoogleAdminStrategy } from '#app/strategies/google-admin.strategy.js';
import { GithubAdminStrategy } from '#app/strategies/github-admin.strategy.js';
import { GoogleAdminOauthGuard } from '#app/guards/google-admin-oauth.guard.js';
import { GithubAdminOauthGuard } from '#app/guards/github-admin-oauth.guard.js';

@Module({
  imports: [UserModule, AuthModule, AdminInvitationModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    GoogleAdminStrategy,
    GithubAdminStrategy,
    GoogleAdminOauthGuard,
    GithubAdminOauthGuard,
  ],
})
export class AdminModule {}
