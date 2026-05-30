import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class EmailService {
  constructor(private readonly rabbitMqQService: RabbitmqService) {}

  sendAccountConfirmationLink(
    userId: number,
    email: string,
    confirmationLink: string,
  ): void {
    this.rabbitMqQService.sendEmailAsync({
      recipients: [email],
      subject: 'Confirmation of your account',
      templateSlug: 'auth-account-confirmation.hbs',
      variables: {
        userName: email,
        confirmationLink,
      },
      userId,
      origin: 'send-account-confirmation-link',
    });
  }

  async reSendAccountConfirmationLink(
    userId: number,
    email: string,
    confirmationLink: string,
  ): Promise<unknown> {
    return this.rabbitMqQService.sendEmail({
      recipients: [email],
      subject: 'Confirmation of your account',
      templateSlug: 'auth-account-confirmation.hbs',
      variables: {
        userName: email,
        confirmationLink,
      },
      userId,
      origin: 'resend-account-confirmation-link',
    });
  }

  async sendResetPasswordLink(
    userId: number,
    email: string,
    resetPasswordLink: string,
  ): Promise<unknown> {
    return this.rabbitMqQService.sendEmail({
      recipients: [email],
      subject: 'Reset your password',
      templateSlug: 'auth-forgot-password.hbs',
      variables: {
        userName: email,
        resetPasswordLink,
      },
      userId,
      origin: 'send-reset-password-link',
    });
  }

  async sendAdminInvitation(
    email: string,
    invitationLink: string,
  ): Promise<unknown> {
    return this.rabbitMqQService.sendEmail({
      recipients: [email],
      subject: 'Invitation à créer votre compte administrateur',
      templateSlug: 'auth-admin-invitation.hbs',
      variables: {
        userName: email,
        invitationLink,
      },
      origin: 'send-admin-invitation-link',
    });
  }
}
