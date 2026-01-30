import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'email_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      // Futurs services
      // {
      //   name: 'NOTIFICATION_SERVICE',
      //   queue: 'notification_queue',
      // }
    ]),
  ],
  providers: [RabbitmqService],
  exports: [RabbitmqService], // ⚠️ Export pour utiliser ailleurs
})
export class RabbitmqModule {}