import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ExternalProvider, HttpMethod } from '@prisma/client';
import { ProviderService } from '../provider/provider.service';
import { GeminiProvider } from './providers/gemini.provider';
import { ILlmResponse } from './providers/types';
import { TExtractedApplication, TExtractStructureTextParams } from './types';
import { APPLICATION_JSON_SCHEMA } from './constants/json-schema';
import {
  STRUCTURE_TEXT_PROMPT,
  FORMAT_FROM_URL_PROMPT,
  FETCH_AND_EXTRACT_PROMPT,
} from './constants/extraction-prompts';
import { ErrorCodeEnum } from 'src/shared/enums/error-codes.enum';
import { extractedApplicationSchema } from './validation/extracted-application.schema';
import { NotAJobPostingError } from './errors/not-a-job-posting.error';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly providerService: ProviderService,
  ) { }

  // =============================================================================
  //                               STRUCTURE TEXT
  // =============================================================================

  async structureText(
    params: TExtractStructureTextParams,
    userId: number,
  ): Promise<TExtractedApplication> {

    if (!params.fetchText && !params.userRawText)
      throw new BadRequestException(
        ErrorCodeEnum.SCRAPER_EXTRACTION_FAILED_ERROR,
      );

    const prompt = params.userRawText
      ? this.__buildPrompt('raw', params.userRawText)
      : this.__buildPrompt('url_content', params.fetchText!, params.sourceUrl);
    const request = {
      prompt,
      maxTokens: 4096,
      jsonSchema: APPLICATION_JSON_SCHEMA as Record<string, unknown>,
    };

    this.logger.log('Attempting structureText with Gemini...');
    const geminiResponse = await this.geminiProvider.structureText(request);

    if (geminiResponse.success) {
      const parsed = this.__parseAndValidate(geminiResponse);
      if (parsed) {
        await this.__logAndTrack(
          geminiResponse,
          ExternalProvider.GEMINI,
          'structureText',
          userId,
          prompt,
        );
        return parsed;
      }
    }

    this.logger.error('Gemini structureText failed');
    throw new Error(ErrorCodeEnum.LLM_STRUCTURING_FAILED_ERROR);
  }

  // =============================================================================
  //                              FETCH AND MAP
  // =============================================================================

  async fetchAndMap(
    url: string,
    userId: number,
  ): Promise<TExtractedApplication> {
    const prompt = this.__buildPrompt('url_fetch',url);
    const request = {
      prompt,
      maxTokens: 4096,
      jsonSchema: APPLICATION_JSON_SCHEMA as unknown as Record<string, unknown>,
    };

    this.logger.log(`Attempting fetchAndMap with Gemini for ${url}...`);
    const geminiResponse = await this.geminiProvider.fetchAndMap(request);

    if (geminiResponse.success) {
      const parsed = this.__parseAndValidate(geminiResponse);
      if (parsed) {
        await this.__logAndTrack(
          geminiResponse,
          ExternalProvider.GEMINI,
          'fetchAndMap',
          userId,
          prompt,
        );
        return parsed;
      }
    }

    this.logger.error('Gemini fetchAndMap failed');
    throw new Error(ErrorCodeEnum.LLM_FETCH_AND_MAP_FAILED_ERROR);
  }

  // =============================================================================
  //                               PRIVATE
  // =============================================================================y

  private __parseAndValidate(
    response: ILlmResponse,
  ): TExtractedApplication | null {
    let raw: unknown;
    try {
      raw = JSON.parse(response.content);
    } catch {
      this.logger.error('Failed to parse LLM JSON response');
      return null;
    }

    const result = extractedApplicationSchema.safeParse(raw);

    if (!result.success) {
      this.logger.warn(
        `Zod validation failed: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
      );
      return null;
    }

    const validated = result.data;

    if (!validated.isSuccess) {
      this.logger.warn('LLM reported isSuccess=false: insufficient data');
      throw new NotAJobPostingError();
    }

    if (!validated.title) {
      this.logger.warn('LLM response missing required "title" field');
      return null;
    }

    return validated as TExtractedApplication;
  }

  private async __logAndTrack(
    response: ILlmResponse,
    provider: ExternalProvider,
    operationPath: string,
    userId: number,
    promptSent: string,
  ): Promise<void> {
    await Promise.all([
      this.providerService.log({
        statusCode: 200,
        operationPath,
        method: HttpMethod.POST,
        provider,
        request: {
          prompt: promptSent.substring(0, 500),
          model: response.model,
        },
        response: {
          content: response.content.substring(0, 1000),
          tokensUsed: response.tokensUsed,
        },
        usedBy: userId,
      }),
      this.providerService.trackUsage({
        userId,
        provider,
        tokensConsumed: response.tokensUsed,
      }),
    ]);
  }


  private __buildPrompt(
    type: 'raw' | 'url_content' | 'url_fetch',
    content: string,
    sourceUrl?: string,
  ): string {
    const templates = {
      raw: STRUCTURE_TEXT_PROMPT,
      url_content: FORMAT_FROM_URL_PROMPT,
      url_fetch: FETCH_AND_EXTRACT_PROMPT,
    };

    const placeholders = {
      raw: '{{RAW_CONTENT}}',
      url_content: '{{PAGE_CONTENT}}',
      url_fetch: '{{URL}}',
    };

    let prompt = templates[type].replace(placeholders[type], content);

    // Inject source URL in url_content prompts (for jobboard detection, etc.)
    if (sourceUrl) {
      prompt = prompt.replace('{{SOURCE_URL}}', sourceUrl);
    }

    return prompt;
  }

}


