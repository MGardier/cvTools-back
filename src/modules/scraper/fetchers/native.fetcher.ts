import { Injectable, Logger } from '@nestjs/common';
import { IFetchResult, IFetcher } from './types';

@Injectable()
export class NativeFetcher implements IFetcher {
  private readonly logger = new Logger(NativeFetcher.name);

  // =============================================================================
  //                               FETCH
  // =============================================================================

  async fetch(url: string): Promise<IFetchResult> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CVToolsBot/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return {
          data: null,
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      const html = await response.text();

      return { data: html, success: true };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.warn(`Native fetch failed for ${url}: ${message}`);

      return { data: null, success: false, error: message };
    }
  }
}
