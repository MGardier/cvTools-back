import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { IEmailPayload } from '../email/types';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  constructor(
    @Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy,
  ) {}
  private readonly logger = new Logger(RabbitmqService.name);
  async onModuleInit() {
    try {
      await this.emailClient.connect();
    } catch (error) {
      this.logger.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  async sendEmail(data: IEmailPayload): Promise<unknown> {
    const RPC_TIMEOUT_MS = 10_000; // 10 seconds
    return firstValueFrom(
      this.emailClient
        .send<unknown>('send_email', data)
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  sendEmailAsync(data: IEmailPayload): void {
    this.emailClient.emit('send_email_async', data);
  }
}
