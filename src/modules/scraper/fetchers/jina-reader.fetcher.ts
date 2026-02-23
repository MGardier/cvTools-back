import { Injectable, Logger } from '@nestjs/common';
import { IFetchResult, IFetcher } from './types';

@Injectable()
export class JinaReaderFetcher implements IFetcher {
  private readonly logger = new Logger(JinaReaderFetcher.name);
  private readonly JINA_BASE_URL = 'https://r.jina.ai/';

  // =============================================================================
  //                               FETCH
  // =============================================================================


  async fetch(url: string): Promise<IFetchResult> {
    try {
      const response = await fetch(`${this.JINA_BASE_URL}${url}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        return {
          data: null,
          success: false,
          error: `Jina Reader returned HTTP ${response.status}`,
        };
      }

      const json = await response.json();

      if (json.code !== 200 || !json.data) {
        return {
          data: null,
          success: false,
          error: `Jina Reader returned code ${json.code}`,
        };
      }

      return { data: JSON.stringify(json, null, 2), success: true };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.warn(`Jina Reader fetch failed for ${url}: ${message}`);

      return { data: null, success: false, error: message };
    }
  }
}
