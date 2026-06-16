import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, ['warn', 'error']);
  // Force exit: AppModule keeps RabbitMQ/Redis connections open, which would
  // otherwise keep the CLI process alive after the command completes.
  process.exit(0);
}

void bootstrap();
