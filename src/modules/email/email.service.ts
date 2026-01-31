import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';


@Injectable()
export class EmailService {
  constructor(
    private readonly rabbitMqQService: RabbitmqService,
  ) { }

  sendAccountConfirmationLink(
    userId: number,
    email: string,
    confirmationLink: string,
  ): void {
    this.rabbitMqQService.sendEmailAsync({
      recipients: [email],
      subject: 'Confirmation of your account',
      templateVersionId: 1,
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
      templateVersionId: 1,
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
      templateVersionId: 2,
      variables: {
        userName: email,
        resetPasswordLink,
      },
      userId,
      origin: 'send-reset-password-link',
    });
  }



}
