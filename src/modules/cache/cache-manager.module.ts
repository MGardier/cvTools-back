import { Global, Module } from '@nestjs/common';

import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import type { Keyv as KeyvEsm } from 'keyv' with {
  'resolution-mode': 'import',
};
import { CacheManagerService } from './cache-manager.service';

// Le cache est une optimisation, pas une dépendance dure : si Redis est HS,
// l'app doit dégrader gracieusement (cache miss) au lieu de se figer.
const REDIS_CONNECT_TIMEOUT_MS = 1_000;
const KEYV_CONNECT_TIMEOUT_MS = 1_500;
const REDIS_RECONNECT_BASE_MS = 200;
const REDIS_RECONNECT_MAX_DELAY_MS = 2_000;
const REDIS_RECONNECT_MAX_ATTEMPTS = 5;

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');

        const redisStore = new Keyv({
          store: new KeyvRedis(
            {
              url: redisUrl,
              socket: {
                connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
                reconnectStrategy: (attempts: number) => {
                  if (attempts > REDIS_RECONNECT_MAX_ATTEMPTS) {
                    return new Error('Redis: max reconnect attempts reached');
                  }
                  return Math.min(
                    attempts * REDIS_RECONNECT_BASE_MS,
                    REDIS_RECONNECT_MAX_DELAY_MS,
                  );
                },
              },
              disableOfflineQueue: true,
            },
            {
              namespace: 'app',
              connectionTimeout: KEYV_CONNECT_TIMEOUT_MS,
              throwOnConnectError: true,
              throwOnErrors: true,
            },
          ),
          namespace: 'app',
        });

        redisStore.on('error', (error: Error) => {
          console.warn(`[Cache] Redis store error: ${error.message}`);
        });

        return {
          // Same keyv package, but typed through its ESM declarations by the
          // ESM-only @nestjs/cache-manager; runtime detection is duck-typed.
          stores: [redisStore as unknown as KeyvEsm],
          ttl: configService.get<number>('CACHE_TTL', 300000),
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
