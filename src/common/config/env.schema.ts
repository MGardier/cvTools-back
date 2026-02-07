import { z } from 'zod';

export const envSchema = z.object({

  // HTTP
  PORT: z.coerce.number().optional(),

  /* #################### DATABASE ########################### */

  DATABASE_URL: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide DATABASE_URL.'
      : 'DATABASE_URL must be a valid URL.',
  }),
  SHOW_SQL: z.enum(['true', 'false', '1', '0']).catch('false').transform((val) => val === 'true' || val === '1'),

  // API POSTGRES (Docker)
  API_POSTGRES_USER: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide API_POSTGRES_USER.'
      : 'API_POSTGRES_USER must be a string.',
  }),
  API_POSTGRES_PASSWORD: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide API_POSTGRES_PASSWORD.'
      : 'API_POSTGRES_PASSWORD must be a string.',
  }),
  API_POSTGRES_DB: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide API_POSTGRES_DB.'
      : 'API_POSTGRES_DB must be a string.',
  }),

  // MS POSTGRES (Docker)
  MS_POSTGRES_USER: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide MS_POSTGRES_USER.'
      : 'MS_POSTGRES_USER must be a string.',
  }),
  MS_POSTGRES_PASSWORD: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide MS_POSTGRES_PASSWORD.'
      : 'MS_POSTGRES_PASSWORD must be a string.',
  }),
  MS_POSTGRES_DB: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide MS_POSTGRES_DB.'
      : 'MS_POSTGRES_DB must be a string.',
  }),

  // PGADMIN (Docker)
  PGADMIN_EMAIL: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide PGADMIN_EMAIL.'
      : 'PGADMIN_EMAIL must be a string.',
  }),
  PGADMIN_PASSWORD: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide PGADMIN_PASSWORD.'
      : 'PGADMIN_PASSWORD must be a string.',
  }),



  /* #################### AUTH  ########################### */

  // HASH
  HASH_SALT_ROUND: z.coerce.number().optional(),

  // GOOGLE
  GOOGLE_CLIENT_ID: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide GOOGLE_CLIENT_ID.'
      : 'GOOGLE_CLIENT_ID must be a string.',
  }),
  GOOGLE_CLIENT_SECRET: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide GOOGLE_CLIENT_SECRET.'
      : 'GOOGLE_CLIENT_SECRET must be a string.',
  }),
  GOOGLE_CALLBACK_URL: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide GOOGLE_CALLBACK_URL.'
      : 'GOOGLE_CALLBACK_URL must be a valid URL.',
  }),

  // GITHUB
  GITHUB_CLIENT_ID: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide GITHUB_CLIENT_ID.'
      : 'GITHUB_CLIENT_ID must be a string.',
  }),
  GITHUB_CLIENT_SECRET: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide GITHUB_CLIENT_SECRET.'
      : 'GITHUB_CLIENT_SECRET must be a string.',
  }),
  GITHUB_CALLBACK_URL: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide GITHUB_CALLBACK_URL.'
      : 'GITHUB_CALLBACK_URL must be a valid URL.',
  }),

  // JWT SECRET
  JWT_DEFAULT_SECRET: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_DEFAULT_SECRET.'
      : 'JWT_DEFAULT_SECRET must be a string.',
  }),
  JWT_REFRESH_SECRET: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_REFRESH_SECRET.'
      : 'JWT_REFRESH_SECRET must be a string.',
  }),
  JWT_FORGOT_PASSWORD_SECRET: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_FORGOT_PASSWORD_SECRET.'
      : 'JWT_FORGOT_PASSWORD_SECRET must be a string.',
  }),

  // JWT EXPIRATION
  JWT_CONFIRMATION_ACCOUNT_EXPIRATION: z.coerce.number({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_CONFIRMATION_ACCOUNT_EXPIRATION.'
      : 'JWT_CONFIRMATION_ACCOUNT_EXPIRATION must be a valid number in ms.',
  }),
  JWT_FORGOT_PASSWORD_EXPIRATION: z.coerce.number({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_FORGOT_PASSWORD_EXPIRATION.'
      : 'JWT_FORGOT_PASSWORD_EXPIRATION must be a valid number in ms.',
  }),
  JWT_REFRESH_EXPIRATION: z.coerce.number({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_REFRESH_EXPIRATION.'
      : 'JWT_REFRESH_EXPIRATION must be a valid number in ms.',
  }),
  JWT_ACCESS_EXPIRATION: z.coerce.number({
    error: (iss) => iss.input === undefined
      ? 'You must provide JWT_ACCESS_EXPIRATION.'
      : 'JWT_ACCESS_EXPIRATION must be a valid number in ms.',
  }),

  // URL
  FRONT_URL_CONFIRMATION_ACCOUNT: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide FRONT_URL_CONFIRMATION_ACCOUNT.'
      : 'FRONT_URL_CONFIRMATION_ACCOUNT must be a valid URL.',
  }),
  FRONT_URL_RESET_PASSWORD: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide FRONT_URL_RESET_PASSWORD.'
      : 'FRONT_URL_RESET_PASSWORD must be a valid URL.',
  }),
  FRONT_URL_OAUTH_CALLBACK_SUCCESS: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide FRONT_URL_OAUTH_CALLBACK_SUCCESS.'
      : 'FRONT_URL_OAUTH_CALLBACK_SUCCESS must be a valid URL.',
  }),
  FRONT_URL_OAUTH_CALLBACK_ERROR: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide FRONT_URL_OAUTH_CALLBACK_ERROR.'
      : 'FRONT_URL_OAUTH_CALLBACK_ERROR must be a valid URL.',
  }),


  /* #################### EXTERNAL SERVICES  ########################### */

  // CACHE
  REDIS_URL: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide REDIS_URL.'
      : 'REDIS_URL must be a valid URL.',
  }),
  CACHE_TTL: z.coerce.number({
    error: (iss) => iss.input === undefined
      ? 'You must provide CACHE_TTL.'
      : 'CACHE_TTL must be a valid number.',
  }),

  // RABBITMQ
  RABBITMQ_URL: z.url({
    error: (iss) => iss.input === undefined
      ? 'You must provide RABBITMQ_URL.'
      : 'RABBITMQ_URL must be a valid URL.',
  }),
  RABBITMQ_USER: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide RABBITMQ_USER.'
      : 'RABBITMQ_USER must be a string.',
  }),
  RABBITMQ_PASSWORD: z.string({
    error: (iss) => iss.input === undefined
      ? 'You must provide RABBITMQ_PASSWORD.'
      : 'RABBITMQ_PASSWORD must be a string.',
  }),
});

export type EnvConfig = z.infer<typeof envSchema>;
