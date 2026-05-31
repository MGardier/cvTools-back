import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AdminInvitationModule } from '../admin-invitation/admin-invitation.module';
import { GoogleAdminStrategy } from 'src/shared/strategies/google-admin.strategy';
import { GithubAdminStrategy } from 'src/shared/strategies/github-admin.strategy';
import { GoogleAdminOauthGuard } from 'src/shared/guards/google-admin-oauth.guard';
import { GithubAdminOauthGuard } from 'src/shared/guards/github-admin-oauth.guard';

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
