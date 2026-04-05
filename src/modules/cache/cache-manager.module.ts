import { Global, Module } from '@nestjs/common';

import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheManagerService } from './cache-manager.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisStore = new Keyv({
          store: new KeyvRedis(redisUrl),
          namespace: 'app',
        });

        return {
          stores: [redisStore],
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
