import { Module } from '@nestjs/common';

import { AdminInvitationController } from './admin-invitation.controller';
import { AdminInvitationService } from './admin-invitation.service';
import { AdminInvitationRepository } from './admin-invitation.repository';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { CreateAdminCommand } from 'src/app/cli/create-admin.command';

@Module({
  imports: [UserModule, EmailModule, AuthModule],
  controllers: [AdminInvitationController],
  providers: [
    AdminInvitationService,
    AdminInvitationRepository,
    CreateAdminCommand,
  ],
  exports: [AdminInvitationService],
})
export class AdminInvitationModule {}
