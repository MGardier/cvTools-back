import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { JinaReaderFetcher } from "./fetchers/jina-reader.fetcher";
import { LlmService } from "../llm/llm.service";
import { TExtractedApplication } from "../llm/types";
import { NotAJobPostingError } from "../llm/errors/not-a-job-posting.error";
import { ErrorCodeEnum } from "src/shared/enums/error-codes.enum";
import { UtilHtmlParser } from "src/shared/utils/html-parser.util";

@Injectable()
export class ScraperStrategies {
  private readonly logger = new Logger(ScraperStrategies.name);
  constructor(
    private readonly jinaReaderFetcher: JinaReaderFetcher,
    private readonly llmService: LlmService,
  ) { }

  async tryJsonLd(
    html: string | null,
    url: string,
    userId: number,
  ): Promise<TExtractedApplication | null> {
    if (!html) return null;

    const jsonLd = UtilHtmlParser.extractJsonLd(html);
    if (!jsonLd) return null;

    return this.tryLlmStructure(
      { fetchText: JSON.stringify(jsonLd), sourceUrl: url },
      userId,
      'JSON-LD',
    );
  }


  async tryVisibleText(
    html: string | null,
    url: string,
    userId: number,
  ): Promise<TExtractedApplication | null> {
    if (!html) return null;

    const visibleText = UtilHtmlParser.extractVisibleText(html);
    if (!visibleText || !UtilHtmlParser.isUsableContent(visibleText)) return null;

    return this.tryLlmStructure(
      { fetchText: visibleText, sourceUrl: url },
      userId,
      'visible text',
    );
  }

   async tryJinaReader(
    url: string,
    userId: number,
  ): Promise<TExtractedApplication | null> {
    const jinaResult = await this.jinaReaderFetcher.fetch(url);

    if (!jinaResult.success || !jinaResult.data || !UtilHtmlParser.isUsableContent(jinaResult.data)) {
      return null;
    }

    return this.tryLlmStructure(
      { fetchText: jinaResult.data, sourceUrl: url },
      userId,
      'Jina Reader',
    );
  }
   async tryGeminiFetch(
    url: string,
    userId: number,
  ): Promise<TExtractedApplication | null> {
    try {
      return await this.llmService.fetchAndMap(url, userId);
    } catch {
      return null;
    }
  }
  async tryLlmStructure(
    input: Parameters<LlmService['structureText']>[0],
    userId: number,
    source: string,
  ): Promise<TExtractedApplication | null> {
    try {
      return await this.llmService.structureText(input, userId);
    }
    catch (error) {
      if (error instanceof NotAJobPostingError) {
        this.logger.warn(`${source}: content is not a job posting`);
        throw new BadRequestException(ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR);
      }
      this.logger.warn(`LLM extraction failed for ${source}: ${(error as Error).message}`);
      return null;
    }
  }
}