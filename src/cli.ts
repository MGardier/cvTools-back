// AppModule must load before nest-commander: the CJS package require()s the
// ESM @nestjs/common, which must already be fully initialized.
import { AppModule } from './app.module.js';

import { CommandFactory } from 'nest-commander';

async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, ['warn', 'error']);
  // Force exit: AppModule keeps RabbitMQ/Redis connections open, which would
  // otherwise keep the CLI process alive after the command completes.
  process.exit(0);
}

void bootstrap();
