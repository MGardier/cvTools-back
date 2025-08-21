import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  constructor(
    @Inject('NATS_TRANSPORT')
    private natsClient: ClientProxy,
  ) {}

  async sendAccountConfirmationLink(email: string, confirmationLink: string) {
    return await this.__sendToMsEmail({
      receivers: [email],
      subject: 'Confirmation of your accout ',
      templatePath: 'auth/account-confirmation.hbs',
      templateVariables: {
        userName: email,
        confirmationLink,
      },
    });
  }

  async sendResetPasswordLink(email: string, resetPasswordLink: string) {
    return await this.__sendToMsEmail({
      receivers: [email],
      subject: 'Reset your password  ',
      templatePath: 'auth/forgot-password.hbs',
      templateVariables: {
        userName: email,
        resetPasswordLink,
      },
    });
  }

  //Todo : améliorer la gestion du ms 
  private async __sendToMsEmail(payload: Record<string, any>) {
    try {
      return await firstValueFrom(
        await this.natsClient.send('email.send', payload),
      );
    } catch (error) {
      
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }
}
