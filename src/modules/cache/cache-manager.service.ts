import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { CACHE_TTL } from './constant';

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  buildCacheKey(
    module: string,
    method: string,
    key: string,
    needHash = false,
  ): string {
    const finalKey = needHash
      ? createHash('sha256')
          .update(key.toLowerCase().trim().replace(/\s+/g, ' '))
          .digest('hex')
      : key;

    return `${module}:${method}:${finalKey}`;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl = CACHE_TTL.default): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}
