import { Command, CommandRunner, Option } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';

import { AdminInvitationService } from '../../modules/admin-invitation/admin-invitation.service';
import { EmailService } from '../../modules/email/email.service';

interface ICreateAdminOptions {
  email: string;
}

@Command({ name: 'create-admin', description: 'Create an admin invitation' })
export class CreateAdminCommand extends CommandRunner {
  constructor(
    private readonly adminInvitationService: AdminInvitationService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'Email of the admin to invite',
  })
  parseEmail(value: string): string {
    if (!isEmail(value)) {
      throw new Error('Invalid email format');
    }

    return value;
  }

  async run(
    _passedParams: string[],
    options: ICreateAdminOptions,
  ): Promise<void> {
    if (!options.email) {
      console.error('❌ --email is required');
      process.exit(1);
    }

    try {
      const { rawToken } = await this.adminInvitationService.createInvitation(
        options.email,
      );

      const baseUrl = this.configService.get<string>(
        'FRONT_URL_ADMIN_REGISTER',
      );
      const link = `${baseUrl}?token=${rawToken}`;

      const expiresInMinutes = Number(
        this.configService.get('ADMIN_INVITATION_EXPIRES_MINUTES') ?? 15,
      );

      await this.emailService.sendAdminInvitation(
        options.email,
        link,
        expiresInMinutes,
      );

      console.log(
        `✅ Invitation admin envoyée à ${options.email} (expire dans ${expiresInMinutes}min)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${message}`);
      process.exit(1);
    }
  }
}
