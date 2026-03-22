/********* INTERFACES *********/

export interface ILlmRequest {
  prompt: string;
  maxTokens: number;
  jsonSchema: Record<string, unknown>;
}

export interface ILlmResponse {
  content: string;
  tokensUsed: number;
  model: string;
  success: boolean;
}

export interface ILlmProvider {
  structureText(request: ILlmRequest): Promise<ILlmResponse>;
  fetchAndMap?(request: ILlmRequest): Promise<ILlmResponse>;
}
