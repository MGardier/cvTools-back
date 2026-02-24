import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NativeFetcher } from './fetchers/native.fetcher';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher';
import { LlmService } from '../llm/llm.service';
import { TExtractedApplication } from '../llm/types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly nativeFetcher: NativeFetcher,
    private readonly jinaReaderFetcher: JinaReaderFetcher,
    private readonly llmService: LlmService,
  ) {}

  // =============================================================================
  //                               EXTRACT
  // =============================================================================

  async extract(
    url: string,
    userId: number,
  ): Promise<TExtractedApplication> {
    // STEP 1: Native fetch + JSON-LD extraction -> LLM structureText
    const nativeResult = await this.nativeFetcher.fetch(url);

    if (nativeResult.success && nativeResult.data) {
      const jsonLd = this.__extractJsonLd(nativeResult.data);

      if (jsonLd) {
        this.logger.log(`JSON-LD JobPosting found for ${url}`);
        try {
          return await this.llmService.structureText(
            JSON.stringify(jsonLd),
            userId,
          );
        } catch (error) {
          this.logger.warn(
            `LLM structureText failed for JSON-LD: ${(error as Error).message}`,
          );
        }
      }

      this.logger.log(`No JSON-LD JobPosting found for ${url}`);
    }

    // STEP 2: Fallback to Jina Reader -> LLM structureText
    this.logger.log(`Falling back to Jina Reader for ${url}`);
    const jinaResult = await this.jinaReaderFetcher.fetch(url);

    if (jinaResult.success && jinaResult.data) {
      this.logger.log(`Jina Reader fetch succeeded for ${url}`);
      try {
        return await this.llmService.structureText(jinaResult.data, userId);
      } catch (error) {
        this.logger.warn(
          `LLM structureText failed for Jina data: ${(error as Error).message}`,
        );
      }
    }

    // STEP 3: Both fetchers failed -> Gemini fetchAndMap with urlContext
    this.logger.log(
      `All fetchers failed, attempting Gemini fetchAndMap for ${url}`,
    );
    try {
      return await this.llmService.fetchAndMap(url, userId);
    } catch {
      this.logger.error(`All extraction methods failed for ${url}`);
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );
    }
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
