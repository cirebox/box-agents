// src/shared/config/ai-models.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIModelsConfig {
  constructor(private configService: ConfigService) {}

  getModelConfig(modelName: string): Record<string, any> {
    const models: Record<string, any> = {
      'gpt-3': {
        provider: 'openai',
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 4000,
      },
      'gpt-4': {
        provider: 'openai',
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        model: 'gpt-4-0125-preview',
        temperature: 0.7,
        maxTokens: 4000,
      },
      llama3: {
        provider: 'ollama',
        baseUrl:
          this.configService.get<string>('OLLAMA_BASE_URL') ||
          'http://localhost:11434',
        model: 'llama3',
        temperature: 0.7,
        maxTokens: 4000,
      },
      mistral: {
        provider: 'ollama',
        baseUrl:
          this.configService.get<string>('OLLAMA_BASE_URL') ||
          'http://localhost:11434',
        model: 'mistral',
        temperature: 0.7,
        maxTokens: 4000,
      },
    };

    return models[modelName] || models['gpt-3'];
  }

  getDefaultModel(): string {
    return this.configService.get<string>('DEFAULT_AI_MODEL') || 'gpt-3';
  }
}
