import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { NativeFetcher } from './fetchers/native.fetcher';
import { TExtractedApplication } from '../llm/types';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { ScraperStrategies } from './scraper.strategies';
import { UtilUrlValidator } from 'src/shared/utils/url-validator.util';
import { CacheManagerService } from '../cache/cache-manager.service';

const NOT_A_JOB_RESULT = { isSuccess: false } as TExtractedApplication;

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  private MAX_TEXT_LENGTH = 15_000;

  constructor(
    private readonly nativeFetcher: NativeFetcher,
    private readonly scrapperStrategies: ScraperStrategies,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  // ═══════════════════════════════════════════════
  //                  PUBLIC API
  // ═══════════════════════════════════════════════

  async extract(
    userId: number,
    url?: string,
    rawContent?: string,
  ): Promise<TExtractedApplication> {
    if (!url && !rawContent)
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );

    const cacheKey = url
      ? this.cacheManagerService.buildCacheKey('scraper', 'extract', url)
      : this.cacheManagerService.buildCacheKey(
          'scraper',
          'extract',
          rawContent!,
          true,
        );

    const cached =
      await this.cacheManagerService.get<TExtractedApplication>(cacheKey);
    if (cached) {
      if (!cached.isSuccess)
        throw new BadRequestException(
          ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
        );

      return cached;
    }

    try {
      const result = rawContent
        ? await this.extractFromRaw(rawContent, userId)
        : await this.extractFromUrl(UtilUrlValidator.validateUrl(url!), userId);

      if (result.isSuccess)
        await this.cacheManagerService.set(cacheKey, result);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException)
        await this.cacheManagerService.set(cacheKey, NOT_A_JOB_RESULT);

      throw error;
    }
  }

  // ═══════════════════════════════════════════════
  //              EXTRACTION STRATEGIES
  // ═══════════════════════════════════════════════

  private async extractFromRaw(
    rawContent: string,
    userId: number,
  ): Promise<TExtractedApplication> {
    if (rawContent.length > this.MAX_TEXT_LENGTH)
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );

    const result = await this.scrapperStrategies.tryLlmStructure(
      { userRawText: rawContent },
      userId,
      'raw content',
    );

    if (!result)
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );

    return result;
  }

  private async extractFromUrl(
    url: string,
    userId: number,
  ): Promise<TExtractedApplication> {
    const nativeResult = await this.nativeFetcher.fetch(url);
    const nativeHtml = nativeResult.success ? nativeResult.data : null;

    const strategies: Array<() => Promise<TExtractedApplication | null>> = [
      () => this.scrapperStrategies.tryJsonLd(nativeHtml, url, userId),
      () => this.scrapperStrategies.tryVisibleText(nativeHtml, url, userId),
      () => this.scrapperStrategies.tryJinaReader(url, userId),
      () => this.scrapperStrategies.tryGeminiFetch(url, userId),
    ];

    for (const strategy of strategies) {
      const result = await strategy();
      if (result) return result;
    }

    this.logger.error(`All extraction strategies failed for ${url}`);
    throw new BadRequestException(
      ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
    );
  }
}
