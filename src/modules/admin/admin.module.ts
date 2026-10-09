import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminInvitationService } from './admin-invitation/admin-invitation.service.js';
import { AdminInvitationRepository } from './admin-invitation/admin-invitation.repository.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmailModule } from '../email/email.module.js';
import { CreateAdminCommand } from '#app/cli/create-admin.command.js';
import { GoogleAdminStrategy } from '#app/strategies/google-admin.strategy.js';
import { GithubAdminStrategy } from '#app/strategies/github-admin.strategy.js';
import { GoogleAdminOauthGuard } from '#app/guards/google-admin-oauth.guard.js';
import { GithubAdminOauthGuard } from '#app/guards/github-admin-oauth.guard.js';

@Module({
  imports: [UserModule, AuthModule, EmailModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminInvitationService,
    AdminInvitationRepository,
    CreateAdminCommand,
    GoogleAdminStrategy,
    GithubAdminStrategy,
    GoogleAdminOauthGuard,
    GithubAdminOauthGuard,
  ],
})
export class AdminModule {}
