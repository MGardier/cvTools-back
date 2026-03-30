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
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
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
