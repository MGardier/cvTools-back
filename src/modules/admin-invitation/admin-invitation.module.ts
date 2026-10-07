import { Module } from '@nestjs/common';

import { AdminInvitationService } from './admin-invitation.service.js';
import { AdminInvitationRepository } from './admin-invitation.repository.js';
import { UserModule } from '../user/user.module.js';
import { EmailModule } from '../email/email.module.js';
import { CreateAdminCommand } from '#src/app/cli/create-admin.command.js';

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
