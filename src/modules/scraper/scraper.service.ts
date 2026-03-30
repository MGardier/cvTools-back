import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NativeFetcher } from './fetchers/native.fetcher';
import { JinaReaderFetcher } from './fetchers/jina-reader.fetcher';
import { LlmService } from '../llm/llm.service';
import { TExtractedApplication } from '../llm/types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { NotAJobPostingError } from '../llm/errors/not-a-job-posting.error';
import { HARD_BLOCK_PATTERNS, MAX_TEXT_LENGTH, SOFT_BLOCK_PATTERNS } from './constants';


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
    userId: number,
    url?: string,
    rawContent?: string,
  ): Promise<TExtractedApplication> {


    //--------- RAW CONTENT PATH: user pasted text directly --------------------\\
    if (rawContent) {
      this.logger.log('Extracting from raw content (user paste)');
      try {
        return await this.llmService.structureText(rawContent, userId);
      } catch (error) {
        if (error instanceof NotAJobPostingError) {
          this.logger.warn('Raw content is not a job posting');
        } else {
          this.logger.error('LLM structureText failed for raw content');
        }
        throw new BadRequestException(
          ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
        );
      }
    }

    //If url and raw content wasn't provided throw error
    if (!url) {
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );
    }

    //---------------- URL PATH: multi-stage fallback ------------------------\\

    // STEP 1: Native fetch + JSON-LD extraction -> LLM structureText
    const nativeResult = await this.nativeFetcher.fetch(url);

    if (nativeResult.success && nativeResult.data) {
      const jsonLd = this.__extractJsonLd(nativeResult.data);

      //JSON-LD found -> LLM structureText
      if (jsonLd) {
        this.logger.log(`JSON-LD JobPosting found for ${url}`);
        try {
          return await this.llmService.structureText(
            JSON.stringify(jsonLd),
            userId,
            url,
          );
        } catch (error) {
          if (error instanceof NotAJobPostingError)
            throw new BadRequestException(
              ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
            );
          this.logger.warn(
            `LLM structureText failed for JSON-LD: ${(error as Error).message}`,
          );
        }
      }

      // STEP 1.5: No JSON-LD → extract visible text from HTML → structureText
      this.logger.log(
        `No JSON-LD JobPosting found for ${url}, trying visible text extraction`,
      );
      const visibleText = this.__extractVisibleText(nativeResult.data);

      if (visibleText && this.__isUsableContent(visibleText)) {
        this.logger.log(
          `Visible text extracted (${visibleText.length} chars), sending to LLM`,
        );
        try {
          return await this.llmService.structureText(visibleText, userId, url);
        } catch (error) {
          this.logger.warn(
            `LLM structureText failed for visible text: ${(error as Error).message}`,
          );
        }
      }
    }

    // STEP 2: Fallback to Jina Reader -> LLM structureText
    this.logger.log(`Falling back to Jina Reader for ${url}`);
    const jinaResult = await this.jinaReaderFetcher.fetch(url);

    if (jinaResult.success && jinaResult.data && this.__isUsableContent(jinaResult.data)) {
      this.logger.log(`Jina Reader fetch succeeded for ${url}`);
      try {
        return await this.llmService.structureText(
          jinaResult.data,
          userId,
          url,
        );
      } catch (error) {
        if (error instanceof NotAJobPostingError)
          throw new BadRequestException(
            ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
          );
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

  // =============================================================================
  //                               PRIVATE
  // =============================================================================

  /**
   * Extract ld+json from html and return JobPosting object
   * 
   */
  private __extractJsonLd(html: string): Record<string, unknown> | null {
    const $ = cheerio.load(html);

    //retrieve ld+json tags
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

  
  /** 
   * Return extract text from html without unnecessary elements
   */
  private __extractVisibleText(html: string): string | null {
    const $ = cheerio.load(html);

    $(
      'script, style, nav, footer, header, iframe, noscript, svg, form, img, video, audio',
    ).remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $(
      '[class*="cookie"], [class*="popup"], [class*="modal"], [class*="sidebar"], [class*="footer"], [class*="header"], [class*="nav"]',
    ).remove();

    const text = $('body').text().replace(/\s+/g, ' ').trim();

    if (text.length < 200) return null;

    return text.slice(0, MAX_TEXT_LENGTH);
  }

  /**
   * Checks if text content is an actual page (not anti-bot, error, or cookie wall).
   * Uses hard patterns (instant reject) + soft patterns weighted by text length:
   *  - Short text (<500) + 1 soft signal  → reject (likely an error page)
   *  - Medium text (<2000) + 2+ signals   → reject
   *  - Long text + 3+ signals             → reject (entire page is a challenge)
   *  - Long text + 1-2 signals            → ok (keyword probably in footer)
   */
  private __isUsableContent(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 100) return false;

    // Hard patterns: never appear in legitimate job postings
    for (const pattern of HARD_BLOCK_PATTERNS) {
      if (pattern.test(trimmed)) {
        this.logger.warn(`Content rejected (hard block): ${pattern.source}`);
        return false;
      }
    }

    // Soft patterns: count signals then weigh against text length
    let signals = 0;
    for (const pattern of SOFT_BLOCK_PATTERNS) {
      if (pattern.test(trimmed)) signals++;
    }

    if (signals === 0) return true;

    const length = trimmed.length;
    const rejected =
      (length < 500 && signals >= 1) ||
      (length < 2000 && signals >= 2) ||
      signals >= 3;

    if (rejected) {
      this.logger.warn(
        `Content rejected (${signals} soft signals, ${length} chars)`,
      );
    }

    return !rejected;
  }

  /*
  * Scans through the possible JSON-LD structures to find where the JobPosting is located.
  */
  private __findJobPosting(parsed: unknown): Record<string, unknown> | null {

    // Check if it's direct JobPosting object
    if (this.__isJobPosting(parsed)) return parsed as Record<string, unknown>;

    // CHeck if it's an array of objects and including JobPosting
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (this.__isJobPosting(item)) return item as Record<string, unknown>;
      }
    }

    // CHeck if it's @graph pattern and including JobPosting
    const record = parsed as Record<string, unknown>;
    if (record?.['@graph'] && Array.isArray(record['@graph'])) {
      for (const item of record['@graph']) {
        if (this.__isJobPosting(item)) return item as Record<string, unknown>;
      }
    }

    return null;
  }

  /**
   * Check whether the object is of type JobPosting 
   */
  private __isJobPosting(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;

    const type = (obj as Record<string, unknown>)['@type'];
    
    //Validation
    if (typeof type === 'string') return type === 'JobPosting';
    if (Array.isArray(type)) return type.includes('JobPosting');

    return false;
  }
}
