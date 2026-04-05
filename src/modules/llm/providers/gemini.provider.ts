import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ILlmProvider, ILlmRequest, ILlmResponse } from './types';

@Injectable()
export class GeminiProvider implements ILlmProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenAI;

  private static readonly MODEL = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  // =============================================================================
  //                               STRUCTURE TEXT
  // =============================================================================

  async structureText(request: ILlmRequest): Promise<ILlmResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: GeminiProvider.MODEL,
        contents: request.prompt,
        config: {
          maxOutputTokens: request.maxTokens,
          responseMimeType: 'application/json',
          responseSchema: request.jsonSchema,
          thinkingConfig: { thinkingBudget: 1024 },
        },
      });

      const content = response.text ?? '';
      const tokensUsed =
        (response.usageMetadata?.promptTokenCount ?? 0) +
        (response.usageMetadata?.candidatesTokenCount ?? 0);

      return {
        content,
        tokensUsed,
        model: GeminiProvider.MODEL,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Gemini structureText failed: ${(error as Error).message}`,
      );
      return {
        content: '',
        tokensUsed: 0,
        model: GeminiProvider.MODEL,
        success: false,
      };
    }
  }

  // =============================================================================
  //                              FETCH AND MAP
  // =============================================================================

  async fetchAndMap(request: ILlmRequest): Promise<ILlmResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: GeminiProvider.MODEL,
        contents: request.prompt,
        config: {
          maxOutputTokens: request.maxTokens,
          responseMimeType: 'application/json',
          responseSchema: request.jsonSchema,
          thinkingConfig: { thinkingBudget: 1024 },
          tools: [{ urlContext: {} }],
        },
      });

      const content = response.text ?? '';
      const tokensUsed =
        (response.usageMetadata?.promptTokenCount ?? 0) +
        (response.usageMetadata?.candidatesTokenCount ?? 0);

      return {
        content,
        tokensUsed,
        model: GeminiProvider.MODEL,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Gemini fetchAndMap failed: ${(error as Error).message}`,
      );
      return {
        content: '',
        tokensUsed: 0,
        model: GeminiProvider.MODEL,
        success: false,
      };
    }
  }
}
