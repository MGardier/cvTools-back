import { Module } from '@nestjs/common';

import { AdminInvitationService } from './admin-invitation.service';
import { AdminInvitationRepository } from './admin-invitation.repository';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { CreateAdminCommand } from 'src/app/cli/create-admin.command';

@Module({
  imports: [UserModule, EmailModule],
  providers: [
    AdminInvitationService,
    AdminInvitationRepository,
    CreateAdminCommand,
  ],
  exports: [AdminInvitationService],
})
export class AdminInvitationModule {}
