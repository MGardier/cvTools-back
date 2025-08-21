
import { Logger } from '@nestjs/common';
import { envSchema, EnvConfig } from './env.schema';


export function validateEnv(): EnvConfig {
  const logger = new Logger('EnvValidation')
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errorMessages = result.error.issues.map(
      err => `${err.path.join('.')}: ${err.message}`
    );
    
    logger.error(' Environment validation failed:');
    errorMessages.forEach(msg => logger.error(`  - ${msg}`));
    
    throw new Error('Invalid environment configuration');
  }
  
  logger.log(' Environment validation successful');
  return result.data;
}