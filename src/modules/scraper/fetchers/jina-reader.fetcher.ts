import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFetchResult, IFetcher } from './types';

@Injectable()
export class JinaReaderFetcher implements IFetcher {
  private readonly logger = new Logger(JinaReaderFetcher.name);

  constructor(private readonly configService: ConfigService) {}

  // =============================================================================
  //                               FETCH
  // =============================================================================

  async fetch(url: string): Promise<IFetchResult> {
    try {
      const baseUrl = this.configService.get<string>('JINA_READER_BASE_URL');
      const response = await fetch(`${baseUrl}${url}`, {
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

      const content =
        typeof json.data === 'string'
          ? json.data
          : (json.data?.content ?? JSON.stringify(json.data));

      return { data: content, success: true };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.warn(`Jina Reader fetch failed for ${url}: ${message}`);

      return { data: null, success: false, error: message };
    }
  }
}
