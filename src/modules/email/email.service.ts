import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';


@Injectable()
export class EmailService {
  constructor(
    private readonly rabbitMqQService: RabbitmqService,
  ) { }

  async sendAccountConfirmationLink(userId: number, email: string, confirmationLink: string) {

    return await this.rabbitMqQService.sendEmail({
      recipients: [email],
      subject: 'Confirmation of your accout ',
      templateVersionId: 1,
      variables: {
        userName: email,
        confirmationLink,
      },
      userId ,
      origin :"send-account-confirmation-link"
    });
  }

  async sendResetPasswordLink(userId: number, email: string, resetPasswordLink: string) {
    return await this.rabbitMqQService.sendEmail({
      recipients: [email],
      subject: 'Confirmation of your accout ',
      templateVersionId: 1,
      variables: {
        userName: email,
        resetPasswordLink,
      },
      userId ,
      origin :"send-account-confirmation-link"
    });
  }



}
