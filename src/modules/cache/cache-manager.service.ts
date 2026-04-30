import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { CACHE_TTL } from './constant';

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);

  // Le cache n'est jamais critique : un get/set qui dépasse ce timeout
  // est traité comme un cache miss silencieux pour ne pas geler la requête.
  private static readonly OP_TIMEOUT_MS = 800;

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
    return this.__safe(() => this.cacheManager.get<T>(key), 'get', key);
  }

  async set<T>(key: string, value: T, ttl = CACHE_TTL.default): Promise<void> {
    await this.__safe(() => this.cacheManager.set(key, value, ttl), 'set', key);
  }

  // ═══════════════════════════════════════════
  //              PRIVATE
  // ═══════════════════════════════════════════

  private async __safe<T>(
    op: () => Promise<T>,
    action: 'get' | 'set',
    key: string,
  ): Promise<T | undefined> {
    try {
      return await this.__withTimeout(op(), CacheManagerService.OP_TIMEOUT_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Cache ${action} failed for key="${key}" — falling back to no-cache (${message})`,
      );
      return undefined;
    }
  }

  private __withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Cache operation timed out after ${ms}ms`)),
        ms,
      );
    });
    return Promise.race([promise, timeout]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }
}
