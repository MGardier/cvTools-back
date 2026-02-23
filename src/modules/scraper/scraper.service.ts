import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NativeFetcher } from './fetchers/native.fetcher';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly nativeFetcher: NativeFetcher,
    private readonly jinaReaderFetcher: JinaReaderFetcher,
  ) {}

  // =============================================================================
  //                               EXTRACT
  // =============================================================================


  async extract(url: string): Promise<void> {
    
    // STEP 1: Native fetch + JSON-LD extraction
    const nativeResult = await this.nativeFetcher.fetch(url);

    if (nativeResult.success && nativeResult.data) {
      const jsonLd = this.__extractJsonLd(nativeResult.data);

      if (jsonLd) {
        this.logger.log(`JSON-LD JobPosting found for ${url}`);
        console.log(jsonLd);
        return;
      }

      this.logger.log(`No JSON-LD JobPosting found for ${url}`);
    }

    // Step 2: Fallback to Jina Reader for extract
    this.logger.log(`Falling back to Jina Reader for ${url}`);
    const jinaResult = await this.jinaReaderFetcher.fetch(url);

    if (jinaResult.success && jinaResult.data) {
      this.logger.log(`Jina Reader fetch succeeded for ${url}`);
      console.log(jinaResult.data);
      return;
    }

    // Both failed
    this.logger.warn(`All extraction methods failed for ${url}`);
    throw new BadRequestException(
      ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
    );
  }

  /********* PRIVATE *********/

  private __extractJsonLd(html: string): Record<string, unknown> | null {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      try {
        const content = $(scripts[i]).html();
        if (!content) continue;

        const parsed = JSON.parse(content);
        const jobPosting = this.__findJobPosting(parsed);

        if (jobPosting) return jobPosting;
      } catch {
        continue;
      }
    }

    return null;
  }

  private __findJobPosting(
    parsed: unknown,
  ): Record<string, unknown> | null {
    // Direct JobPosting object
    if (this.__isJobPosting(parsed))
      return parsed as Record<string, unknown>;

    // Array of objects
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (this.__isJobPosting(item))
          return item as Record<string, unknown>;
      }
    }

    // @graph pattern
    const record = parsed as Record<string, unknown>;
    if (record?.['@graph'] && Array.isArray(record['@graph'])) {
      for (const item of record['@graph']) {
        if (this.__isJobPosting(item))
          return item as Record<string, unknown>;
      }
    }

    return null;
  }

  private __isJobPosting(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;

    const type = (obj as Record<string, unknown>)['@type'];

    if (typeof type === 'string') return type === 'JobPosting';
    if (Array.isArray(type)) return type.includes('JobPosting');

    return false;
  }
}
