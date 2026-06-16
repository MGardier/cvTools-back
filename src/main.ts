import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(cookieParser());

  // Shared Redis (same REDIS_URL as the cache) as the session store, so the
  // OAuth admin flow survives a multi-instance deployment. Connection is
  // non-blocking: the app still boots if Redis is momentarily down.
  const sessionRedisClient = createClient({ url: process.env.REDIS_URL });
  sessionRedisClient.on('error', (error: Error) =>
    console.warn(`[Session] Redis error: ${error.message}`),
  );
  void sessionRedisClient.connect();

  app.use(
    session({
      store: new RedisStore({
        client: sessionRedisClient,
        prefix: 'admin-sess:',
      }),
      secret: process.env.JWT_DEFAULT_SECRET ?? '',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 600000, // 10 minutes
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
