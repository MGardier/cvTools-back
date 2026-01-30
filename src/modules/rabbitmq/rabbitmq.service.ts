import { Injectable, Inject} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IEmailPayload } from '../email/types';


@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy,
  ) {}


async sendEmail(data: IEmailPayload) {
  return await firstValueFrom(
    this.emailClient.send('send_email', data)
  );
}

sendEmailAsync(data: IEmailPayload): void {
  this.emailClient.emit('send_email_async', data);
}
}