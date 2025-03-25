// src/shared/providers/ai-provider.factory.ts
import { Injectable } from '@nestjs/common';
import { IAIProvider } from './interfaces/iai-provider';
import { OpenAIProvider } from './implementations/openai-provider';
import { OllamaProvider } from './implementations/ollama-provider';
import { AIModelsConfig } from '../config/ai-models.config';

@Injectable()
export class AIProviderFactory {
  constructor(
    private openAIProvider: OpenAIProvider,
    private ollamaProvider: OllamaProvider,
    private aiModelsConfig: AIModelsConfig,
  ) {}

  getProvider(modelName?: string): IAIProvider {
    const modelConfig = this.aiModelsConfig.getModelConfig(
      modelName || this.aiModelsConfig.getDefaultModel(),
    );

    switch (modelConfig.provider) {
      case 'openai':
        return this.openAIProvider;
      case 'ollama':
        return this.ollamaProvider;
      default:
        return this.openAIProvider;
    }
  }
}
